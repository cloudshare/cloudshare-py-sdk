using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace cssdk.test
{
    [TestClass]
    public class RandomAlphaNumGeneratorTest
    {
        [TestMethod]
        public void Generate_returns_a_string_with_given_length()
        {
            var generator = new RandomAlphaNumGenerator();

            var result = generator.Generate(17);

            Assert.AreEqual(17, result.Length);
        }

        [TestMethod]
        public void Generate_returns_a_string_with_only_alhpha_numeric_characters()
        {
            var generator = new RandomAlphaNumGenerator();

            var result = generator.Generate(17);

            Assert.IsTrue(new Regex(@"^\w+$").Match(result).Success);
        }
    }
}
