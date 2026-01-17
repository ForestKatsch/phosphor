import z from "zod";
import { GenericHandler } from "./router";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  ResponseConfig,
  type RouteConfig,
} from "@asteasolutions/zod-to-openapi";

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const handleOpenApi: GenericHandler<z.ZodType> = ({ router }) => {
  const registry = new OpenAPIRegistry();

  for (const route of router.introspect()) {
    for (const method of route.methods) {
      const responses: Record<string, ResponseConfig> = {};

      console.log(route.path);

      if (method.response == null) {
        responses[204] = {
          description: "No Content",
        };
      } else {
        responses[200] = {
          description: "Success",
          content: {
            'application/json': {
              schema: method.response
            }
          }
        };
      }

      const request: NonNullable<RouteConfig["request"]> = {
        params: route.params,
      };

      if (method.query) {
        request.query = method.query;
      }

      if (method.body) {
        request.body = {
          content: {
            "application/json": {
              schema: method.body,
            },
          },
        };
      }

      registry.registerPath({
        path: route.path,
        method: method.method,
        request,
        responses
      });
    }
  }


  const generator = new OpenApiGeneratorV31(registry.definitions);

  return Promise.resolve(generator.generateDocument({
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'My API',
      description: 'This is the API',
    },
    servers: [{ url: 'v1' }],
  }));
}