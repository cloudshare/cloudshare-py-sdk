#!/usr/bin/python
import sys
import os
import sys
from .ioc import get_requester
import re


def memoize(f):
    memo = {}

    def helper(*args):
        if args not in memo:
            memo[args] = f(*args)
        return memo[args]

    return helper


@memoize
def get_obj_id(url,obj_name):
    for obj in get(url):
        if obj['name']==obj_name:
            return obj['id']
    else:
        raise Exception('{} not found in {}'.format(obj_name,url))


def get_obj_ids_by_pat(url,obj_name_pat):
    res = []

    for obj in get(url):
        if re.search(obj_name_pat,obj['name']):
            res.append(obj['id'])

    return res


def get_env_ids_by_pat(name_pat):
    return get_obj_ids_by_pat('/envs/?criteria=0',name_pat)


def get_proj_id(name):
    return get_obj_id('/projects/',name)


def get_bp_id(proj_id,name):
    return get_obj_id('/projects/{}/blueprints'.format(proj_id),name)


def get_policy_id(proj_id,name):
    return get_obj_id('/projects/{}/policies'.format(proj_id),name)


def get_region_id(name):
    return get_obj_id('/regions/',name)


def get_template_id(name, region_id):
    return get_obj_id('/templates?templateType=1&regionId={}'.format(region_id),name)


def create_env_from_bp_using_names(dct):
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
                    "blueprintId": "my blueprint"
                }
            ]
        }
    '''

    dct['environment']['projectId'] = get_proj_id(dct['environment']['projectId'])
    dct['environment']['policyId'] = get_policy_id(dct['environment']['projectId'],
                                                   dct['environment']['policyId'])
    dct['environment']['regionId'] = get_region_id(dct['environment']['regionId'])

    dct['itemsCart'][0]['blueprintId'] = get_bp_id(dct['environment']['projectId'],
                                                   dct['itemsCart'][0]['blueprintId'])

    return post('/envs', dct)


def create_env_from_tempalte_cart_using_names(dct):
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
    dct['environment']['projectId'] = get_proj_id(dct['environment']['projectId'])
    dct['environment']['policyId'] = get_policy_id(dct['environment']['projectId'],
                                                   dct['environment']['policyId'])
    dct['environment']['regionId'] = get_region_id(dct['environment']['regionId'])

    for item in dct['itemsCart']:
        item['name'] = item['templateVmId']
        item['description'] = item['templateVmId']
        item['templateVmId'] = get_template_id(item['templateVmId'],
                                               dct['environment']['regionId'])

    return post('/envs', dct)

def with_env_prefix(env_token):
    if not env_token.startswith('EN'):
        return 'EN'+env_token
    else:
        return env_token

def suspend(env_token):
    return put('/envs/actions/suspend?envId={}&immediate=true'.format(with_env_prefix(env_token)))


def resume(env_token):
    return put('/envs/actions/resume?envId={}'.format(with_env_prefix(env_token)))


def env_get_extended(env_token):
    return get('/envs/actions/getextended?envId={}'.format(with_env_prefix(env_token)))

def get_envs():
    return get('envs/?brief=false')


def del_env(env_token):
    return request('DELETE', '/envs/'+with_env_prefix(env_token))


def post(path, content=None):
    return request('POST', path, content=content)


def get(path, queryParams=None):
    return request('GET', path, queryParams=queryParams)


def put(path, queryParams=None):
    return request('PUT', path)


def request(method, path, queryParams=None, content=None):

    res = get_requester().request(hostname=os.environ.get('CLOUDSHARE_HOSTNAME', "use.cloudshare.com"),
                                  method=method,
                                  apiId=os.environ.get('CLOUDSHARE_API_ID'),
                                  apiKey=os.environ.get('CLOUDSHARE_API_KEY'),
                                  path=path,
                                  queryParams=queryParams,
                                  content=content)

    if res.status // 100 != 2:
        print(res.status, res.content)
        raise Exception('Error')

    return res.content
