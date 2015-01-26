using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace cssdk.test
{
    [TestClass]
    public class Sha1StringHasherTest
    {
        [TestMethod]
        public void Hash_hashes_hello_world_correctly()
        {
            var hasher = new Sha1StringHasher();

            var hash = hasher.Hash("hello world");

            Assert.AreEqual("2aae6c35c94fcfb415dbe95f408b9ce91ee846ed", hash);
        }
    }
}
