#!/usr/bin/env python3
import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_ecr as ecr,
    Environment
)
import aws_cdk.aws_apprunner_alpha as apprunner
from constructs import Construct

class AppRunnerStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ECRリポジトリの参照
        repository = ecr.Repository.from_repository_name(
            self, "NextjsRepo",
            repository_name="nextjs-app-runner"
        )

        # App Runner Service
        apprunner.Service(
            self, "NextjsAppRunnerService",
            source=apprunner.Source.from_ecr(
                image_configuration=apprunner.ImageConfiguration(
                    port=3000
                ),
                repository=repository,
                tag="latest"
            ),
            cpu=apprunner.Cpu.QUARTER_VCPU,
            memory=apprunner.Memory.HALF_GB,
            auto_deployments_enabled=False
        )

app = cdk.App()
AppRunnerStack(app, "NextjsAppRunnerStack",
    env=Environment(
        account="626299819722",
        region="ap-northeast-1"
    )
)

app.synth()
