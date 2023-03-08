import type { APIRoute } from "astro";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { fetchWithTimeout } from "~/utils/tool";

const openApiKeyStr = import.meta.env.OPENAI_API_KEY;
console.log("openApiKeyStr", openApiKeyStr);

const apiKeys = (openApiKeyStr || "").split(",");

export const post: APIRoute = async (context) => {
  const body = await context.request.json();
  // 随机选择一个 API key（系统提供）
  const presetApiKey = apiKeys.length
    ? apiKeys[Math.floor(Math.random() * apiKeys.length)]
    : "";

  // 用户输入的内容（包含api key)
  let { messages, key, temperature = 0.6 } = body;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (!key) {
    key = presetApiKey;
  }

  if (!key) {
    return new Response("没有填写 OpenAI API key");
  }

  if (!messages) {
    return new Response("没有输入任何文字");
  }

  // 直接请求 OpenAI API

  const completion = await fetchWithTimeout(
    "https://api.openai.com/v1/chat/completions",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature,
        stream: true,
      }),
    }
  );

  const stream = new ReadableStream({
    async start(controller) {
      const streamParser = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            // response = {
            //   id: 'chatcmpl-6pULPSegWhFgi0XQ1DtgA3zTa1WR6',
            //   object: 'chat.completion.chunk',
            //   created: 1677729391,
            //   model: 'gpt-3.5-turbo-0301',
            //   choices: [
            //     { delta: { content: '你' }, index: 0, finish_reason: null }
            //   ],
            // }
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(streamParser);

      for await (const chunk of completion.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
};
