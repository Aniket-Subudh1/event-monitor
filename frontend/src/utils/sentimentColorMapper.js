/**
 * Utility for mapping sentiment values to colors and styles
 */

const sentimentColorMapper = {
    // Get color based on sentiment string
    getSentimentColor: (sentiment) => {
      switch(sentiment) {
        case 'positive':
          return '#10B981'; // green-500
        case 'neutral':
          return '#6B7280'; // gray-500
        case 'negative':
          return '#EF4444'; // red-500
        default:
          return '#6B7280'; // gray-500
      }
    },
    
    // Get background color based on sentiment string
    getSentimentBgColor: (sentiment) => {
      switch(sentiment) {
        case 'positive':
          return '#D1FAE5'; // green-100
        case 'neutral':
          return '#F3F4F6'; // gray-100
        case 'negative':
          return '#FEE2E2'; // red-100
        default:
          return '#F3F4F6'; // gray-100
      }
    },
    
    // Get text color based on sentiment string
    getSentimentTextColor: (sentiment) => {
      switch(sentiment) {
        case 'positive':
          return '#065F46'; // green-800
        case 'neutral':
          return '#1F2937'; // gray-800
        case 'negative':
          return '#991B1B'; // red-800
        default:
          return '#1F2937'; // gray-800
      }
    },
    
    // Get color based on sentiment score (range -1 to 1)
    getColorFromScore: (score) => {
      // No score
      if (score === undefined || score === null) {
        return '#6B7280'; // gray-500
      }
      
      // Negative scores (red)
      if (score < 0) {
        const intensity = Math.min(Math.abs(score), 1);
        // Interpolate between light red and dark red
        const r = Math.floor(239 + intensity * (220 - 239)); // from #EF4444 to #DC2626
        const g = Math.floor(68 + intensity * (38 - 68));
        const b = Math.floor(68 + intensity * (38 - 68));
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      // Positive scores (green)
      if (score > 0) {
        const intensity = Math.min(score, 1);
        // Interpolate between light green and dark green
        const r = Math.floor(16 + intensity * (5 - 16)); // from #10B981 to #059669
        const g = Math.floor(185 + intensity * (150 - 185));
        const b = Math.floor(129 + intensity * (105 - 129));
        return `rgb(${r}, ${g}, ${b})`;
      }
      
      // Neutral (score = 0)
      return '#6B7280'; // gray-500
    },
    
    // Get tailwind class for sentiment badge
    getSentimentBadgeClass: (sentiment) => {
      switch(sentiment) {
        case 'positive':
          return 'bg-green-100 text-green-800';
        case 'neutral':
          return 'bg-gray-100 text-gray-800';
        case 'negative':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    },
    
    // Get icon name for sentiment
    getSentimentIcon: (sentiment) => {
      switch(sentiment) {
        case 'positive':
          return 'ThumbUpIcon';
        case 'neutral':
          return 'MinusCircleIcon';
        case 'negative':
          return 'ThumbDownIcon';
        default:
          return 'QuestionMarkCircleIcon';
      }
    },
    
    // Get label for sentiment
    getSentimentLabel: (sentiment) => {
      switch(sentiment) {
        case 'positive':
          return 'Positive';
        case 'neutral':
          return 'Neutral';
        case 'negative':
          return 'Negative';
        default:
          return 'Unknown';
      }
    },
    
    // Convert numerical score to sentiment category
    scoreToSentiment: (score) => {
      if (score === null || score === undefined) return 'neutral';
      
      if (score > 0.2) {
        return 'positive';
      } else if (score < -0.2) {
        return 'negative';
      } else {
        return 'neutral';
      }
    },
    
    // Get percentage for visualization (0-100)
    getPercentage: (score) => {
      if (score === null || score === undefined) return 50;
      
      // Convert -1 to 1 scale to 0 to 100
      return Math.round((score + 1) * 50);
    }
  };
  
  export default sentimentColorMapper;