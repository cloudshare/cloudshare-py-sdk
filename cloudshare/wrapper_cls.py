#!/usr/bin/python
import sys
import os
import sys
from .ioc import get_requester
import re
import copy


def memoize(f):
    memo = {}

    def helper(*args):
        if args not in memo:
            memo[args] = f(*args)
        return memo[args]

    return helper


class Wrapper(object):
    def __init__(self, hostname, api_id, api_key):
        self.hostname = hostname or os.environ.get('CLOUDSHARE_HOSTNAME', "use.cloudshare.com")
        self.api_id = api_id or os.environ.get('CLOUDSHARE_API_ID')
        self.api_key = api_key or os.environ.get('CLOUDSHARE_API_KEY')

    @memoize
    def get_obj_id(self, url, obj_name):
        for obj in self.get(url):
            if obj['name'] == obj_name:
                return obj['id']
        else:
            raise Exception('{} not found in {}'.format(obj_name, url))

    def get_obj_ids_by_pat(self, url, obj_name_pat):
        res = []

        for obj in self.get(url):
            if re.search(obj_name_pat, obj['name']):
                res.append(obj['id'])

        return res

    def get_env_ids_by_pat(self, name_pat):
        return self.get_obj_ids_by_pat('/envs/?criteria=0', name_pat)

    def get_proj_id(self, name):
        return self.get_obj_id('/projects/', name)

    def get_bp_id(self, proj_id, name):
        return self.get_obj_id('/projects/{}/blueprints'.format(proj_id), name)

    def get_snapshot_id(self, project_name, bp_name, snapshot_name):
        snap = self.get_bp_snapshot(project_name, bp_name, snapshot_name)
        return snap['id']

    def get_policy_id(self, proj_id, name):
        return self.get_obj_id('/projects/{}/policies'.format(proj_id), name)

    def get_region_id(self, name):
        return self.get_obj_id('/regions/', name)

    def get_template_id(self, name, region_id):
        return self.get_obj_id('/templates?templateType=1&regionId={}'.format(region_id), name)

    def create_env_from_bp_using_names(self, dct):
        '''
            expected dct:

            {
                "environment": {
                    "name": "my env",
                    "projectId": "my project",
                    "policyId": "3 days",
                    "regionId": 'Miami' / 'VMware_Singapore' / 'VMware_Amsterdam'
                },
                "itemsCart": [
                    {
                        "type": 1,
                        "blueprintId": "my blueprint",
                        "snapshotId": "my snapshot"
                    }
                ]
            }
        '''
        new_dct = copy.deepcopy(dct)

        new_dct['environment']['projectId'] = self.get_proj_id(new_dct['environment']['projectId'])
        new_dct['environment']['policyId'] = self.get_policy_id(new_dct['environment']['projectId'],
                                                           dct['environment']['policyId'])
        new_dct['environment']['regionId'] = self.get_region_id(new_dct['environment']['regionId'])

        new_dct['itemsCart'][0]['blueprintId'] = self.get_bp_id(new_dct['environment']['projectId'],
                                                           new_dct['itemsCart'][0]['blueprintId'])

        if dct['itemsCart'][0].get('snapshotId'):
            new_dct['itemsCart'][0]['snapshotId'] = self.get_snapshot_id(
                dct['environment']['projectId'],
                dct['itemsCart'][0]['blueprintId'],
                dct['itemsCart'][0]['snapshotId'])

        return self.post('/envs', new_dct)

    def create_env_from_tempalte_cart_using_names(self, dct):
        '''
        {
            expected dct:

           "environment":{
              "name": "John's environment",
              "projectId": "my project",
              "teamId": "my team",
              "policyId": "4 days",
              "regionId": 'Miami' / 'VMware_Singapore' / 'VMware_Amsterdam'
              "description": ""
           },
           "preview": false,
           "itemsCart": [
              {
                 "type":2,
                 "name": "my ubuntu",
                 "description":"ubuntu running a webserver",
                 "chocolateyPackages":[],
                 "templateVmId":"Ubuntu 16.0"
              },
              {
                 "type": 2,
                 "name": "my windows",
                 "description":" domain controller",
                 "chocolateyPackages": [],
                 "templateVmId": "Windows 2012"
              }
           ]
        }
        '''
        dct['environment']['projectId'] = self.get_proj_id(dct['environment']['projectId'])
        dct['environment']['policyId'] = self.get_policy_id(dct['environment']['projectId'],
                                                       dct['environment']['policyId'])
        dct['environment']['regionId'] = self.get_region_id(dct['environment']['regionId'])

        for item in dct['itemsCart']:
            item['name'] = item['templateVmId']
            item['description'] = item['templateVmId']
            item['templateVmId'] = self.get_template_id(item['templateVmId'],
                                                   dct['environment']['regionId'])

        return self.post('/envs', dct)

    def with_env_prefix(self, env_token):
        if not env_token.startswith('EN'):
            return 'EN' + env_token
        else:
            return env_token

    def suspend(self, env_token):
        return self.put('/envs/actions/suspend?envId={}&immediate=true'.format(self.with_env_prefix(env_token)))

    def resume(self, env_token):
        return self.put('/envs/actions/resume?envId={}'.format(self.with_env_prefix(env_token)))

    def revert(self, env_token):
        return self.put('/envs/actions/revert?envId={}'.format(self.with_env_prefix(env_token)))

    def env_get_extended(self, env_token):
        return self.get('/envs/actions/getextended?envId={}'.format(self.with_env_prefix(env_token)))

    def env_get_short(self, env_token):
        return self.get('/envs/{}'.format(self.with_env_prefix(env_token)))

    def get_envs(self, ):
        return self.get('envs/?brief=false')

    def del_env(self, env_token):
        return self.request('DELETE', '/envs/{}'.format(self.with_env_prefix(env_token)))

    def get_project_bps(self, project_name):
        return self.get('/Projects/{project_id}/blueprints'.format(
            project_id=self.get_proj_id(project_name)
        ))

    def remove_bp_from_project(self, project_name, bp_name):
        return self.put('/Projects/{project_id}/blueprints/{bp_id}/removeFromProject'.format(
            project_id=self.get_proj_id(project_name),
            bp_id=self.get_bp_id(self.get_proj_id(project_name), bp_name)
        ))

    def add_bp_to_project(self, src_project_name, dest_project_name, bp_name):
        return self.post('/Projects/{dest_project_id}/blueprints/{bp_id}/Post'.format(
            dest_project_id=self.get_proj_id(dest_project_name),
            bp_id=self.get_bp_id(self.get_proj_id(src_project_name), bp_name)
        ))

    def execute_path(self, vm_id, command):
        content = {
            "vmId": vm_id,
            "path": command
        }
        return self.post('/vms/actions/executepath', content)

    def check_execution_status(self, vm_id, execution_id):
        return self.get('/vms/actions/checkexecutionstatus?vmId={}&executionId={}'.format(vm_id, execution_id))

    def take_snapshot(self, env_id, new_snapshot_name, set_as_default, new_bp_name=None):
        content = {
            "envId": env_id,
            "name": new_snapshot_name,
            "description": "This Snapshot's description",
            "newBlueprintName": new_bp_name,
            "otherBlueprintId": None,
            "setAsDefault": set_as_default
        }

        return self.post('/snapshots/actions/takesnapshot', content)

    def get_bp(self, project_name, bp_name):
        project_id = self.get_proj_id(project_name)
        bp_id = self.get_bp_id(project_id, bp_name)
        return self.get('/projects/{project_id}/blueprints/{bp_id}'.format(project_id=project_id, bp_id=bp_id))

    def get_bp_snapshots(self, project_name, bp_name):
        bp = self.get_bp(project_name, bp_name)
        return bp['createFromVersions']

    def get_bp_snapshot(self, project_name, bp_name, snapshot_name):
        bp = self.get_bp(project_name, bp_name)
        matches = list(filter(lambda x: x['name'] == snapshot_name, bp['createFromVersions']))
        if len(matches) == 0:
            raise Exception('snapshot not found {} {} {}'.format(project_name, bp_name, snapshot_name))
        else:
            return matches[0]

    def change_bp_ownership(self, proj_name, bp_name, node_id):
        proj_id = self.get_proj_id(proj_name)
        bp_id = self.get_bp_id(proj_id, bp_name)
        return self.put('/backendadmin/Actions/changeBlueprintOwner?blueprintId={bp_id}&nodeId={node_id}'.format(
            bp_id=bp_id,
            node_id=node_id
        ))

    def get_external_id(self, internal_id, entity_type='EN'):
        return wrapper.get('/admin/Actions/TranslateInternalIdToExternalId?internalId={}&entityType={}'.format(
            internal_id, entity_type))

    def post(self, path, content=None):
        return self.request('POST', path, content=content)

    def get(self, path, queryParams=None):
        return self.request('GET', path, queryParams=queryParams)

    def put(self, path, queryParams=None):
        return self.request('PUT', path)

    def request(self, method, path, queryParams=None, content=None):
        res = get_requester().request(hostname=self.hostname,
                                      method=method,
                                      apiId=self.api_id,
                                      apiKey=self.api_key,
                                      path=path,
                                      queryParams=queryParams,
                                      content=content)

        if res.status // 100 != 2:
            print(res.status, res.content)
            raise Exception('Error')

        return res.content
