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
1. Keep ONLY attributes that affect pricing:
   - Processing type (e.g., Boneless, Sliced)
   - Certification (e.g., Organic)
   - Size grade (e.g., Large, Extra Large)
   - Variety if price differs (e.g., Russet Potato vs Sweet Potato)
2. Remove marketing terms that don't affect price:
   - Fresh, Premium, Natural, Finest, Select
   - Brand names unless it's a packaged product
3. For packaged items, include quantity in parentheses

Examples:
- "Fresh Premium Boneless Skinless Chicken Breast" -> "Boneless Skinless Chicken Breast"
- "Organic Large Brown Eggs" -> "Organic Large Brown Egg"
- "Farm Fresh Large White Eggs" -> "Large White Egg"
- "Premium Russet Potatoes" -> "Russet Potato"
- "Natural Whole Milk" -> "Whole Milk"
- "Organic 2% Milk" -> "Organic 2% Milk"
- "12-Pack Coca Cola Cans" -> "Cola (12 cans)"

For unit type, ONLY return the following units:
Weight units (preferred): g, kg, mg, lb, oz
Volume units (preferred): ml, l, fl oz, pt, gal
Count unit: EA (use only if no weight/volume applicable)

For unit value, ONLY return numeric values without any letters or symbols:
Examples: 
- "142g" -> {"unitValue": "142", "unitType": "g"}
- "2 lb Organic Chicken" -> {"unitValue": "2", "unitType": "lb"}
- "12 pack Cola" -> {"productName": "Cola (12 cans)", "unitValue": "1", "unitType": "EA"}

Rules:
1. Do not include any other text or explanation, especially any markdown marks
2. Always prefer weight or volume units when possible
3. Use count unit (EA) only when item has no clear weight/volume
4. Never use currency units or any other units not listed above
5. unitValue must ONLY contain numbers and decimal points, no letters or symbols
6. For packaged items, include the package quantity in the product name and use EA as unit
7. Keep only attributes that affect store pricing

Return ONLY a JSON object in this format:
{
  "productName": "general item name",
  "priceValue": "price value",
  "unitValue": "numeric value only",
  "unitType": "unit type from allowed list"
}`,
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
