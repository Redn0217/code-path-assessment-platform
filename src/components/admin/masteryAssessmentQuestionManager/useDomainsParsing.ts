
import React from 'react';

export const useDomainsParsing = (assessment: any) => {
  const parsedDomains = React.useMemo(() => {
    if (!assessment?.domains) return [];
    
    try {
      // If it's already an array, return it
      if (Array.isArray(assessment.domains)) {
        return assessment.domains;
      }
      
      // If it's a string, parse it
      if (typeof assessment.domains === 'string') {
        return JSON.parse(assessment.domains);
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing domains:', error);
      return [];
    }
  }, [assessment?.domains]);

  return parsedDomains;
};
