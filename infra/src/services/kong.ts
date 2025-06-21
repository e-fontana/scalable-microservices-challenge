import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import { cluster } from "../cluster";
import { kongDockerImage } from "../images/kong";
import { ordersHttpListener } from "./orders";
import { appLoadBalancer } from "../load-balancer";

const proxyTargetGroup = appLoadBalancer.createTargetGroup('proxy-target', {
    port: 8000,
    protocol: 'HTTP',
    healthCheck: {
        path: '/orders/health',
        protocol: 'HTTP'
    }
})

export const proxyHttpListener = appLoadBalancer.createListener('proxy-listener', {
    port: 80,
    protocol: 'HTTP',
    targetGroup: proxyTargetGroup
})

const proxyAdminTargetGroup = appLoadBalancer.createTargetGroup('proxy-admin-target', {
    port: 8002,
    protocol: 'HTTP',
    healthCheck: {
        path: '/',
        protocol: 'HTTP'
    }
})

export const proxyAdminHttpListener = appLoadBalancer.createListener('proxy-admin-listener', {
    port: 8002,
    protocol: 'HTTP',
    targetGroup: proxyAdminTargetGroup
})

const proxyAdminAPITargetGroup = appLoadBalancer.createTargetGroup('proxy-admin-api-target', {
    port: 8001,
    protocol: 'HTTP',
    healthCheck: {
        path: '/',
        protocol: 'HTTP'
    }
})

export const proxyAdminAPIHttpListener = appLoadBalancer.createListener('proxy-admin-api-listener', {
    port: 8001,
    protocol: 'HTTP',
    targetGroup: proxyAdminAPITargetGroup
})

export const kongService = new awsx.classic.ecs.FargateService("fargate-kong", {
    cluster,
    desiredCount: 1,
    waitForSteadyState: false,
    taskDefinitionArgs: {
        container: {
            image: kongDockerImage.ref,
            cpu: 256,
            memory: 512,
            portMappings: [
                proxyHttpListener,
                proxyAdminHttpListener,
                proxyAdminAPIHttpListener
            ],
            environment: [
                { name: "KONG_DATABASE", value: "off" },
                { name: "KONG_ADMIN_LISTEN", value: '0.0.0.0:8001' },
                { 
                  name: 'ORDERS_SERVICE_URL', 
                  value: pulumi.interpolate`http://${ordersHttpListener.endpoint.hostname}:${ordersHttpListener.endpoint.port}`
                }
            ]
        }
    }
})
