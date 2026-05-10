/**
 * Mock AI Engine for Crop Suggestions
 * In a real-world scenario, this would call a ML model API with soil data
 */
export const suggestCrops = (area, location) => {
  const crops = [
    { name: 'Wheat', suitability: 95, reason: 'Optimal soil moisture in this region.' },
    { name: 'Cotton', suitability: 88, reason: 'High temperature suitability detected.' },
    { name: 'Sugarcane', suitability: 72, reason: 'Requires high water availability.' },
    { name: 'Maize', suitability: 82, reason: 'Good drainage in the area.' }
  ];
  
  return crops.sort((a, b) => b.suitability - a.suitability);
};
