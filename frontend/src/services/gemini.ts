// Rate limit error message handling
export class RateLimitError extends Error {
  constructor() {
    super('Rate limit reached');
    this.name = 'RateLimitError';
  }
}

const RESUME_TEMPLATE = `
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  experienceTitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  experienceDetails: {
    fontSize: 12,
    marginBottom: 3,
    color: '#666',
  },
  bulletPoint: {
    fontSize: 12,
    marginBottom: 3,
    marginLeft: 15,
  }
});

const ResumeDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.section}>
        <Text style={styles.header}>John Doe</Text>
        <Text style={styles.subHeader}>Software Engineer</Text>
        <Text style={styles.subHeader}>contact@email.com</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.bulletPoint}>
          Experienced software engineer with expertise in web development
        </Text>
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.experienceTitle}>Software Engineer</Text>
          <Text style={styles.experienceDetails}>Tech Company | 2020 - Present</Text>
          <Text style={styles.bulletPoint}>• Spearheaded development of payment gateway integration for e-commerce platform, leading team of 5 developers and reducing transaction processing time by 35%</Text>
          <Text style={styles.bulletPoint}>• Architected and implemented microservices migration strategy for legacy monolithic application, resulting in 60% improved deployment frequency and 45% reduction in system downtime</Text>
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.bulletPoint}>• JavaScript, React, Node.js</Text>
        <Text style={styles.bulletPoint}>• Python, TypeScript</Text>
      </View>

      {/* Education Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <Text style={styles.experienceTitle}>Bachelor of Science in Computer Science</Text>
        <Text style={styles.experienceDetails}>University Name | 2019</Text>
      </View>
    </Page>
  </Document>
);

export default ResumeDocument;
`;

export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiResponse {
  message: string;
  reactCode?: string;
  modelResponse: ChatMessage;
}

export const generatePDFContent = async (history: ChatMessage[], newMessage: ChatMessage): Promise<GeminiResponse> => {
  try {
    // Always include system prompt in API history
    const systemPrompt = `Act as an advanced resume builder system, who uses react to create ats friendly resume. You use below optimization techniques.

ATS Optimization:
- Match exact keywords from job description, whenever user provide a job description
- Use standard headers (Experience, Education, Skills)
- No tables, columns, or graphics

HR Appeal. When ever you write experience section, use STAR method is compulsary :
- Start bullets with action verbs
- Include numbers/percentages
- Focus on last 5-7 years
- Show clear job progression
- Customize for each role

Must Include:
- Full contact details
- Complete dates (MM/YYYY)
- Company names and locations
- Relevant technical skills
- Certifications

Avoid:
- Fancy formatting
- Unexplained gaps
- Generic descriptions
- Personal information
- Photos/logos

---------
check if below asked quesries is about modifying resume or not related to resume.
On normal queries, do not provide any react code. Answer the asked question, clearly and professionally.

Whenever you are asked to change in resume, always provide what you made changes shortly and Most importantly, always provide only one react code snippet, that give the updated resume.
You may only asked to change one part of resume at a time. So only made changes accordingly, do not ask for full resume details at once, only ask one by one. Always provide full resume react code.

Below is a resume template written with react code.

-----------
${RESUME_TEMPLATE}
-----------

Please follow above provided template style and made changes accordingly the details i will provide.`;

    // Create API history with system prompt always first
    const apiHistory = [{
      role: "user",
      parts: [{ text: systemPrompt }]
    }, 
    ...history, 
    newMessage];
    
    // Send request to local API
    const response = await fetch('http://127.0.0.1:8000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: apiHistory,
        message: newMessage.parts[0].text
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const text = await response.text();
    
    // Look specifically for ```javascript code block
    const codeMatch = text.match(/```react\n([\s\S]*?)```/);
    
    const modelResponse: ChatMessage = {
      role: "model",
      parts: [{ text }]
    };
    
    if (!codeMatch) {
      // For general responses, return the entire text with markdown
      return { 
        message: text.trim(),
        modelResponse
      };
    }

    // For resume updates, only return the message before code block
    const message = text.slice(0, codeMatch.index).trim();
    const cleanedCode = codeMatch[1].trim();

    // Validate React-PDF code
    if (!cleanedCode.includes('import React') || 
        !cleanedCode.includes('<Document>') ||
        !cleanedCode.includes('</Document>')) {
      return {
        message: "I understand your request but couldn't generate valid React-PDF code. " + message,
        modelResponse
      };
    }

    return {
      message,
      reactCode: cleanedCode,
      modelResponse
    };
  } catch (error: any) {
    console.error('Error generating content:', error);
    
    // Check for rate limit errors
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new RateLimitError();
    }
    
    // Check for internal server error (500)
    if (error.message?.includes('500')) {
      console.log('Server error detected. Retrying in 60 seconds...');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
      return generatePDFContent(history, newMessage); // Retry the request
    }
    
    throw error;
  }
};
