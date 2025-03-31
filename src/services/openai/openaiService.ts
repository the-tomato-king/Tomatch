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
          content: `You are a receipt analyzer that extracts product information. 

Product Name Rules:
1. Extract the most general/basic form of the product name
2. Remove brand names, origins, and descriptive modifiers unless they're essential
3. Use singular form unless it's naturally plural
Examples:
- "Fresh Ontario Wild Blueberries" -> "Blueberry" (no plural)
- "Organic Gala Apples" -> "Apple"
- "Kirkland Signature Greek Yogurt" -> "Greek Yogurt"

For unit type, ONLY return the following units:
Weight units (preferred): kg, lb, oz
Volume units (preferred): l
Count units (use only if no weight/volume applicable): EA, PK

For unit value, ONLY return numeric values without any letters or symbols:
Examples: "142g" -> {"unitValue": "142", "unitType": "g"}

Rules:
1. Do not include any other text or explanation, especially any markdown marks
2. Always prefer weight or volume units when possible
3. Use count units (each/pack) only when item has no clear weight/volume
4. Never use currency units or any other units not listed above
5. unitValue must ONLY contain numbers and decimal points, no letters or symbols`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this receipt image and extract: product name (in its most general form), price, and unit of measure. Return ONLY a JSON object in this format: {"productName": "general item name", "priceValue": "price value", "unitValue": "numeric value only", "unitType": "unit type from allowed list"}.',
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
