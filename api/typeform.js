export const handler = async (event, context) => {
  // 1. Get credentials from environment variables
  const TYPEFORM_TOKEN = process.env.TYPEFORM_API_KEY;
  const FORM_ID = "IeHZ2FIw"; // Or use process.env.TYPEFORM_FORM_ID

  try {
    const response = await fetch(
      `https://api.typeform.com/forms/${FORM_ID}/responses`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TYPEFORM_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Typeform API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};