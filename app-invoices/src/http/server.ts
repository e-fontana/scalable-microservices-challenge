
import '@opentelemetry/auto-instrumentations-node/register'

import '../broker/subscriber.ts';

import fastifyCors from '@fastify/cors';
import { fastify } from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider
} from 'fastify-type-provider-zod';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' });

app.get('/health', (request, reply) => {
    console.log('[Invoices] Health check received');
    return reply.status(200).send({ status: 'OK' });
})

app.listen({ port: 3334, host: '0.0.0.0'}).then(() => {
    console.log('[Invoices] Server is running on http://localhost:3334');
})
