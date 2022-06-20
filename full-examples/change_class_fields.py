import cloudshare
import requests

# This script modifies specific values in a class
#
# Get projects ids: https://docs.cloudshare.com/rest-api/v3/training/class/get-class/
# 
# Parameters documentation: https://docs.cloudshare.com/rest-api/v3/training/class/put-api-v3-class/
# Replace <api key>, <api id>, <class id>

classId = '<class id>'
res = cloudshare.req(hostname='use.cloudshare.com',
                                method='GET',
                                path=f'class/{classId}',
                                apiId='<api id>',
                                apiKey='<api key>')
data = res.content
# Change needed fields here:
data["name"] = "new name"

res = cloudshare.req(hostname='use.cloudshare.com',
                                method='PUT',
                                content=data,
                                path=f'class/{classId}',
                                apiId='<api id>',
                                apiKey='<api key>')
print(res.status)
if (res.status / 100 != 2):
        raise Exception(res.status, res.content)
print(res.content)
print(res)
