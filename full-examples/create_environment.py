import cloudshare
import requests

# This script creates a new environment from a blueprint
#
# Get projects ids: https://use.cloudshare.com/api/v3/projects
# Get policies ids: https://use.cloudshare.com/api/v3/projects/<project id>/policies
# Get regions: https://use.cloudshare.com/api/v3/regions
# Get blueprint ids: https://use.cloudshare.com/api/v3/projects/<project id>/blueprints
# 
# Parameters documentation: https://docs.cloudshare.com/rest-api/v3/environments/envs/post-envs/
# Replace projectId, policyId, regionId, name, apiId, apiKey

projectId = "PRXYZXYZXYZXYZ"
policyId = "POABCABCABCABC"
regionId = "REXYZXYZXYZ"
bpId = "BPABCABCABC"

data= {
"environment": {
 "name": "environment name",
 "projectId": projectId,
 "policyId": policyId,
 "regionId": regionId,
  },
"itemsCart": [{"type": 1, "blueprintId": bpId}],
}

res = cloudshare.req(hostname='use.cloudshare.com',
                                method='POST',
                                path='envs',
                                content=data,
                                apiId='<api id>',
                                apiKey='<api key>')
print(res.status)
if (res.status / 100 != 2):
        raise Exception(res.status, res.content)
print(res.content)
