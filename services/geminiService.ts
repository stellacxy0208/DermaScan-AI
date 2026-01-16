import { GoogleGenAI } from "@google/genai";

// Remove conflicting global declaration
// We cast window to any to access the injected aistudio object

export const checkApiKey = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio) {
    return await win.aistudio.hasSelectedApiKey();
  }
  // Fallback for local dev if window.aistudio is missing, though instructions imply it's available.
  // We assume false to trigger the UI if the environment object is missing.
  return false;
};

export const openApiKeySelection = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio) {
    await win.aistudio.openSelectKey();
  }
};

export const generateSkinAnalysis = async (base64Image: string): Promise<string> => {
  // Always create a new instance to pick up the potentially newly selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 string if it contains metadata header
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const prompt = `
    Act as a professional VISIA Skin Analysis System. 
    Input: The attached face photo.
    Task: Generate a single high-resolution 2x3 grid image (2 columns x 3 rows) containing 6 specific clinical analysis views of this EXACT person.
    
    CRITICAL: 
    1. You MUST strictly preserve the facial features, identity, expression, and head angle of the input person. Do not create a new person.
    2. The output must be a single cohesive image arranged in a 2x3 grid.
    3. Apply the following clinical filters to the original face in this order:

    [Row 1, Column 1] Brown Spots / Pigmentation
    - Tone: Brown/Sepia Base.
    - Texture: Rough, high graininess/noise texture.
    - Negative Feature Inversion: Hair (eyebrows, eyelashes, hairline) must appear as GLOWING, HIGH-BRIGHTNESS MILKY WHITE or PALE YELLOW.
    - Exception: LIPS must NOT glow. They should remain dark/natural sepia tone.
    - Pigmentation Visualization: Facial skin covered with HIGH-CONTRAST deep brown to black irregular spots showing deep epidermal pigmentation.

    [Row 1, Column 2] Red Areas / Vascular
    - Tone: Clinical Vascular Map (Pale Pink/White base).
    - Skin Base: Pale pink to almost white.
    - Anomalies: Deep red patterns showing inflammation and capillaries.
    - Highlights: Replace natural reflections with DEEP RED SHADOWS.
    - Features: Hair, eyebrows, eyelashes, and pupil/iris MUST glow bright white.

    [Row 2, Column 1] UV Spots / Deep Damage
    - Tone: Monochrome UV Photography.
    - Skin Base: Deep dark/black (absorbing UV light).
    - Visualization: Damaged spots appear as distinct BRIGHT WHITE "stars" or speckles against black skin (Negative Film effect).
    - Constraint: No neon outlines. Spots look like white pigment on black surface.
    - Features: Hair, eyebrows, eyelashes, hairline, and lips MUST remain DARK/BLACK.

    [Row 2, Column 2] Wood's Light / Porphyrins
    - Tone: Dark Blue/Purple (UV Light Room).
    - Effect: Skin looks dark blue/violet.
    - Skin: Fluorescent pink or orange glowing dots in pores (nose, chin, forehead).

    [Row 3, Column 1] Polarized Wrinkles
    - Technique: Cross-polarized photography (matte finish, no surface reflection).
    - Subject State: Eyes closed.
    - Focus: Crow's feet, forehead lines, mouth corners.
    - Analysis Overlay: Superimpose a network of fine GREEN lines precisely tracing and tracking every detected wrinkle direction.
    - Region of Interest: Draw a CYAN/TEAL contour line outlining specific analysis areas (e.g. around eyes or forehead).
    - Style: High clinical accuracy.

    [Row 3, Column 2] Polarized Pores
    - Technique: Cross-polarized photography (eliminates oil shine).
    - Subject State: Eyes closed.
    - Focus: Nose, cheeks, chin (dense micropores).
    - Analysis Overlay: Superimpose dense BRIGHT PURPLE or PINK small dots, each marking a detected enlarged pore.
    - Region of Interest: Draw a CYAN/TEAL contour line outlining the nose and cheek analysis areas.
    - Style: Scientific data visualization.

    Output format: A single image containing the 2x3 grid. No text overlays or borders between grid cells.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      },
      config: {
        // We want a high fidelity image
      }
    });

    // Extract image from response
    // The model usually returns the generated image in the candidates parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Skin analysis generation failed:", error);
    throw error;
  }
};