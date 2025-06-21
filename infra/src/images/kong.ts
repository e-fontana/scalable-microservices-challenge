import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi";

const kongEcrRepository = new awsx.ecr.Repository("kong-ecr", {
    forceDelete: true,
})

const kongECRToken = aws.ecr.getAuthorizationTokenOutput({
    registryId: kongEcrRepository.repository.registryId,
})

export const kongDockerImage = new docker.Image("kong-image", {
    tags: [
        pulumi.interpolate`${kongEcrRepository.repository.repositoryUrl}:latest`,
    ],
    context: {
        location: "../docker/kong",
    },
    push: true,
    platforms: [
        "linux/amd64"
    ],
    registries: [
        {
            address: kongEcrRepository.repository.repositoryUrl,
            username: kongECRToken.userName,
            password: kongECRToken.password,
        }
    ]
})

