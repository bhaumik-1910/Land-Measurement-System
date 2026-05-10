/**
 * Mock AI Engine for Crop Suggestions
 * This logic simulates an AI analysis by using the land area and location 
 * to generate unique, varied suggestions for each plot.
 */
export const suggestCrops = (areaSqM, coordinates = []) => {
  // Use area as a seed for pseudo-randomness so the same plot always gets same results
  const seed = Math.floor(areaSqM) % 100;
  
  // Larger pool of potential crops in Gujarat/India
  const allCrops = [
    { name: 'Wheat', baseSuitability: 85, minArea: 500, reason: 'Optimal soil moisture and seasonal climate detected.' },
    { name: 'Cotton', baseSuitability: 80, minArea: 1000, reason: 'High temperature suitability and black soil profile detected.' },
    { name: 'Sugarcane', baseSuitability: 70, minArea: 2000, reason: 'Availability of water resources in this region is ideal.' },
    { name: 'Maize', baseSuitability: 75, minArea: 400, reason: 'Good soil drainage and loamy texture identified.' },
    { name: 'Groundnut', baseSuitability: 82, minArea: 800, reason: 'Sandy-loam soil detected, perfect for groundnut growth.' },
    { name: 'Castor', baseSuitability: 78, minArea: 1200, reason: 'Arid tolerance of this variety matches your land profile.' },
    { name: 'Bajra', baseSuitability: 88, minArea: 200, reason: 'Drought-resistant variety suggested for this specific terrain.' },
    { name: 'Cumin', baseSuitability: 65, minArea: 1500, reason: 'Specific micro-climate in this area favors high-quality cumin.' },
    { name: 'Mustard', baseSuitability: 72, minArea: 600, reason: 'Cooler temperatures in the upcoming season favor mustard.' },
    { name: 'Tobacco', baseSuitability: 60, minArea: 2500, reason: 'Large-scale plantation possible with current soil pH.' }
  ];

  // Filter crops based on minimum area (some crops aren't viable for tiny plots)
  const viableCrops = allCrops.filter(crop => areaSqM >= (crop.minArea / 2));

  // Generate unique scores and pick top 4
  const suggested = viableCrops.map((crop, index) => {
    // Variance based on seed (area) and index
    const variance = ((seed + (index * 13)) % 15) - 7; // -7 to +7%
    const finalSuitability = Math.min(98, Math.max(40, crop.baseSuitability + variance));
    
    return {
      ...crop,
      suitability: finalSuitability
    };
  });

  // Sort by suitability and return top 4 unique results for this specific area
  return suggested
    .sort((a, b) => b.suitability - a.suitability)
    .slice(0, 4);
};
