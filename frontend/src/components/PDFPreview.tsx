import React, { memo, useEffect, useState } from 'react';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { transform } from '@babel/standalone';

// Register Arial font with all variants
Font.register({
  family: 'Arial',
  fonts: [
    {
      src: '/fonts/ARIAL.ttf',
      fontWeight: 'normal',
      fontStyle: 'normal'
    },
    {
      src: '/fonts/ARIALBD.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal'
    },
    {
      src: '/fonts/ARIALI.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic'
    },
    {
      src: '/fonts/ARIALI.ttf',
      fontWeight: 'light',
      fontStyle: 'italic'
    }
  ]
});

interface PDFPreviewProps {
  content: string;
}

const PDFPreview: React.FC<PDFPreviewProps> = memo(({ content }) => {
  const [ResumeComponent, setResumeComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const codeToTransform = content;

      // Transform the code string into a component
      const result = transform(codeToTransform, {
        presets: ['react'],
        filename: 'resume.tsx',
      });

      if (!result.code) {
        throw new Error('Failed to transform code');
      }

      // Extract the component part (everything between the imports and the export)
      const componentCode = result.code.replace(/import.*?;/g, '').replace(/export default.*?;/, '');

      // Create a function that returns the component
      const createComponent = new Function(
        'React',
        'Document',
        'Page',
        'Text',
        'View',
        'StyleSheet',
        `${componentCode} return ResumeDocument;`
      );

      // Create the component with the required dependencies
      const Component = createComponent(React, Document, Page, Text, View, StyleSheet);
      setResumeComponent(() => Component);
      setError(null);
    } catch (err) {
      console.error('Error rendering PDF:', err);
      setError('Error rendering PDF. Please check the content format.');
      setResumeComponent(null);
    }
  }, [content]);

  if (error || !ResumeComponent) {
    return (
      <div className="pdf-preview-container flex items-center justify-center h-full">
        <div className="p-6 rounded-xl border border-red-500/20 slide-in">
          <div className="text-red-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error || 'Error rendering PDF'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-preview-container h-full w-full rounded-xl overflow-hidden custom-scrollbar">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <ResumeComponent />
      </PDFViewer>
    </div>
  );
});

PDFPreview.displayName = 'PDFPreview';

export default PDFPreview;
