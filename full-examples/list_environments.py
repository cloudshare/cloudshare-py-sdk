import cloudshare
import requests

# This script lists all your environments
#
# Parameters documentation: https://docs.cloudshare.com/rest-api/v3/environments/envs/get-envs/
# apiId, apiKey

res = cloudshare.req(hostname='use.cloudshare.com',
                                method='GET',
                                path='envs',
                                apiId='<api id>',
                                apiKey='<api key>')
print(res.status)
if (res.status / 100 != 2):
        raise Exception(res.status, res.content)
print("These are my environments:")
print(res.content)
