import '@opentelemetry/auto-instrumentations-node/register'
import { trace } from '@opentelemetry/api'

import fastifyCors from '@fastify/cors';
import { fastify } from 'fastify';
import { setTimeout } from 'node:timers/promises';
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';
import { db } from '../db/client.ts';
import { schema } from '../db/schema/index.ts';
import { tracer } from '../tracer/tracer.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' });

app.get('/health', (request, reply) => {
    console.log('[Orders] Health check received');
    return reply.status(200).send({ status: 'OK' });
})

app.post('/orders', {
    schema: {
        body: z.object({
            amount: z.coerce.number()
        })
    }
}, async (request, reply) => {
    const { amount } = request.body
    console.log(`[Orders] Received order with amount: ${amount}`);

    const orderId = crypto.randomUUID();

    try {
        await db.insert(schema.orders).values({
            id: orderId,
            customerId: 'b7def6b4-b840-4b21-ac37-c19e0aa56505',
            amount,
        })
    } catch (error) {
        console.error('[Orders] Error inserting order into database:', error);
    }

    trace.getActiveSpan()?.setAttribute('order.id', orderId);

    dispatchOrderCreated({
        orderId,
        amount,
        customer: {
            id: 'b7def6b4-b840-4b21-ac37-c19e0aa56505'
        }
    })

    return reply.status(201).send()
})

app.listen({ port: 3333, host: '0.0.0.0'}).then(() => {
    console.log('[Orders] Server is running on http://localhost:3333');
})
