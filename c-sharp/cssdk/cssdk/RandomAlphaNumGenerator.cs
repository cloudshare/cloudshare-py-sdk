/*
Copyright 2015 CloudShare Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
using System;
using System.Linq;

namespace cssdk
{
    public interface IRandomAlphaNumGenerator
    {
        string Generate(int length);
    }

    public class RandomAlphaNumGenerator : IRandomAlphaNumGenerator
    {
        private const string Alphanum = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        public string Generate(int length)
        {
            
            var random = new Random();
            return string.Join("", Enumerable.Range(0, length).Select(_ => Alphanum[random.Next(Alphanum.Length)].ToString()));
        }
    }
}