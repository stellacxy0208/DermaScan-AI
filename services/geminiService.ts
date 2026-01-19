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
    Role: Professional VISIA Skin Analysis System (Top-tier Dermatology Imaging).
    Input: The attached face photo.
    Task: Generate a single high-resolution 2x3 grid image (2 columns x 3 rows) containing 6 specific clinical analysis views of this EXACT person.
    
    CRITICAL PROTOCOLS:
    1. IDENTITY & EXPRESSION PRESERVATION: You MUST strictly preserve the facial features, identity, **EXACT FACIAL EXPRESSION**, and head angle of the input person. Do not morph the face or change the mood/demeanor.
    2. Grid Layout: Output a single image with a 2x3 grid layout.
    3. Composition: In EACH grid cell, Zoom out slightly to ensure the FULL FACE is visible from the top of the forehead to the chin. Do not crop the chin or forehead.
    4. Background: The background behind the face must be BLURRED (Bokeh effect) to isolate the clinical subject.
    5. Clinical Accuracy: Apply the following dermatological filters to the original face in this specific order:

    [Row 1, Column 1] Brown Spots (Pigmentation)
    - Technique: Negative Cross-Polarized RBX (Inverted).
    - Appearance: **Sepia-Brown Negative Film** (Brownish-Sepia Base).
    - Texture: **High Noise / Grainy Film Texture**.
    - Lighting: **COMPLETELY MATTE**. No skin reflection, no shine, no gloss.
    - Key Feature: Eyebrows, eyelashes, hairline, and facial hair MUST appear GLOWING BRIGHT WHITE (Negative effect).
    - Visualization: Deep epidermal pigmentation (melanin), freckles, and age spots appear as DISTINCT DARK BROWN or BLACK spots against the sepia negative background.

    [Row 1, Column 2] Red Areas (Vascular)
    - Technique: Hemoglobin Map.
    - Appearance: Pale pink/clinical white base.
    - Visualization: Capillaries, inflammation, and spider veins appear as DEEP RED patterns.
    - Negative Feature: Hair, eyebrows, and eyes must glow BRIGHT WHITE.

    [Row 2, Column 1] UV Spots (Deep Sun Damage)
    - Technique: UV Fluorescence Photography (365nm).
    - Appearance: **EXTREME HIGH CONTRAST Monochromatic Black & White**.
    - Skin Tone: Healthy skin areas must appear **DEEP PITCH BLACK** (Total Light Absorption).
    - Feature Preservation: Hair, eyebrows, and eyelashes must appear BLACK/DARK (Natural). DO NOT use negative film effect on hair for this view.
    - Visualization: **"White Stars" Effect**: Subcutaneous UV damage and sun spots must appear as **INTENSE STARK WHITE or LIGHT GRAY SPOTS**, densely scattered like bright stars in a dark night sky (像夜空中的星星一样密集散布在深黑色皮肤上).
    - Exclusions: **DO NOT confuse natural skin highlights (gloss/shine) with UV spots**. Highlights/Reflections must remain black/dark. Only pigment damage glows white.
    - Effect: **Maximum Contrast**. Absolute Black healthy skin vs. Stark White damaged spots.

    [Row 2, Column 2] Wood's Light (Bacteria/Oil)
    - Technique: UV Blue Light Room.
    - Appearance: Deep Blue/Violet "Avatar" skin tone.
    - Visualization: Porphyrins (bacterial excretions) and sebum in pores must fluoresce as **BRIGHT, GLOWING PINK or ORANGE DOTS with a HALO/BLOOM effect**.
    - Focus Areas: **Strictly target areas with high oil secretion**: Nose wings, Forehead (T-Zone), and Cheeks with enlarged pores.
    - Constraint: Only these oily areas should glow with the halo effect. The rest of the face remains deep blue/violet.

    [Row 3, Column 1] Wrinkles (Texture Topology)
    - Technique: Cross-Polarized (No Glare/Oil).
    - Visual Style: Natural skin tone (NOT grayscale). Completely matte finish, zero surface reflection.
    - AI Overlay: Superimpose a precise network of fine BRIGHT GREEN lines tracing every wrinkle and fine line.
    - Focus Areas: Crow's feet, Forehead lines, and Nasolabial folds.
    - CONSTRAINT: **TRUE ANALYSIS ONLY**. Strictly follow the ORIGINAL lines and expression of the person. **DO NOT ADD FAKE WRINKLES**. Only trace what is visible in the source image.

    [Row 3, Column 2] Pores (Surface Analysis)
    - Technique: High Definition Macro.
    - Visual Style: Natural skin tone. Extreme clarity.
    - AI Overlay: Superimpose dense BRIGHT PURPLE small dots marking enlarged pores.
    - Focus Areas: Heavy concentration on Nose wings, T-Zone, and Cheeks.
    - CONSTRAINT: **TRUE DETECTION ONLY**. Only overlay dots on areas where the system actually detects **enlarged** pores. Do not mark normal smooth skin.

    Output format: A single image file containing the 2x3 grid. No text labels inside the image.
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
        imageConfig: {
          aspectRatio: "9:16",
          imageSize: "1K"
        }
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