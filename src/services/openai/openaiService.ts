import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

interface ReceiptData {
  productName?: string;
  priceValue?: string;
  unitValue?: string;
  unitType?: string;
  // store?: string; //TODO: get user's current location and auto-fill the store name
}

export const analyzeReceiptImage = async (
  base64Image: string
): Promise<ReceiptData> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a receipt analyzer that extracts product information. For units, ONLY use these specific units:
Weight units (preferred): g, 100g, kg, mg, lb, oz
Volume units (preferred): ml, l, fl oz, pt, gal
Count units (use only if no weight/volume applicable): each, pack
Rules:
1. Do not include any other text or explanation especially the markdown formatting
2. Always prefer weight or volume units when possible
3. Use count units (each/pack) only when item has no clear weight/volume
4. Never use currency units or any other units not listed above
For units, please separate the value and type. Example:
Input: "142g" -> {"unitValue": "142", "unitType": "g"}
Input: "2.5kg" -> {"unitValue": "2.5", "unitType": "kg"}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this receipt image and extract: product name, price, and unit of measure. Return ONLY a JSON object in this format: {"productName": "item name", "priceValue": "price value", "unitValue": "unit value", "unitType": "unit type from allowed list"}. For unit, strictly use only the allowed units provided in system message.',
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    console.log("OpenAI Raw Response:", response.choices[0].message.content);

    try {
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.log("Failed content:", response.choices[0].message.content);
      return {
        productName: "",
        priceValue: "",
        unitValue: "",
        unitType: "",
      };
    }
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw error;
  }
};
