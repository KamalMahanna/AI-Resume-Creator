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
    fontFamily: 'Arial',
  },
  section: {
    marginBottom: 1,
  },
  header: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Arial',
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 10,
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Arial',
  },
  sectionTitle: {
    fontSize: 11,
    marginBottom: 3,
    marginTop: 5,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    borderBottom: 1,
    paddingBottom: 2,
  },
  experienceTitle: {
    fontSize: 11,
    marginBottom: 3,
    justifyContent: 'space-between',
    flexDirection: 'row',
    fontFamily: 'Arial',
    fontWeight: 'bold',
  },
  experienceDate: {
    fontSize: 10,
    textAlign: 'right',
    fontFamily: 'Arial',
    fontStyle: 'italic',
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: 1,
    lineHeight: 1.3,
  },
  bullet: {
    fontSize: 10,
    fontFamily: 'Arial',
    width: 10,
  },
  bulletText: {
    fontSize: 10,
    fontFamily: 'Arial',
    flex: 1,
  }
});

const ResumeDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.section}>
        <Text style={styles.header}>JOHN DOE</Text>
        <Text style={styles.subHeader}>Software Engineer | contact@email.com | (123) 456-7890 | github.com/johndoe</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUMMARY</Text>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bulletText}>Experienced software engineer with expertise in web development</Text>
        </View>
      </View>

      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EXPERIENCE</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.experienceTitle}>
            <Text>Software Engineer, Tech Company</Text> <Text style={styles.experienceDate}>01/2020 - Present</Text>
          </View>
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Spearheaded development of payment gateway integration for e-commerce platform, leading team of 5 developers and reducing transaction processing time by 35%</Text>
          </View>
          <View style={styles.bulletPointContainer}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Architected and implemented microservices migration strategy for legacy monolithic application, resulting in 60% improved deployment frequency and 45% reduction in system downtime</Text>
          </View>
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SKILLS</Text>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>JavaScript, React, Node.js</Text>
        </View>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>Python, TypeScript</Text>
        </View>
      </View>

      {/* Education Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>EDUCATION</Text>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.experienceTitle}>
            <Text>Bachelor of Science in Computer Science, University Name</Text>
            <Text style={styles.experienceDate}>09/2015 - 05/2019</Text>
          </View>
        </View>
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
    
    // Get API key from storage
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Send request to local API
    const response = await fetch('http://127.0.0.1:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
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
    
    // Look for code blocks with different language identifiers
    const codeMatch = text.match(/```(?:react|javascript|jsx)\n([\s\S]*?)```/);
    
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
    if (error.message?.includes('No API key provided')) {
      throw new Error('API key required');
    } else if (error.message?.includes('Invalid API key')) {
      throw new Error('Invalid API key');
    } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
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
