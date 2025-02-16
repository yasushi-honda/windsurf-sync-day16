import aws_cdk as core
import aws_cdk.assertions as assertions

from app_runner_cdk.app_runner_cdk_stack import AppRunnerCdkStack

# example tests. To run these tests, uncomment this file along with the example
# resource in app_runner_cdk/app_runner_cdk_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = AppRunnerCdkStack(app, "app-runner-cdk")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
