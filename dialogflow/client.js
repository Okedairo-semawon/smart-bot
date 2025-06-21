import dialogflow from '@google-cloud/dialogflow';

const sessionClient = new dialogflow.SessionsClient();

export async function detectIntent(projectId, sessionId, message, languageCode = 'en') {
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode
      }
    }
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;

  return {
    intent: result.intent.displayName,
    confidence: result.intentDetectionConfidence,
    response: result.fulfillmentText,
    parameters: result.parameters.fields
  };
}
