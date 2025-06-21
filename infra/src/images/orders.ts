import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi";

const ordersEcrRepository = new awsx.ecr.Repository("orders-ecr", {
    forceDelete: true,
})

const ordersECRToken = aws.ecr.getAuthorizationTokenOutput({
    registryId: ordersEcrRepository.repository.registryId,
})

export const ordersDockerImage = new docker.Image("orders-image", {
    tags: [
        pulumi.interpolate`${ordersEcrRepository.repository.repositoryUrl}:latest`,
    ],
    context: {
        location: "../app-orders",
    },
    push: true,
    platforms: [
        "linux/amd64"
    ],
    registries: [
        {
            address: ordersEcrRepository.repository.repositoryUrl,
            username: ordersECRToken.userName,
            password: ordersECRToken.password,
        }
    ]
})

