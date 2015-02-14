using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.Mvc;
using MMLib.RapidPrototyping.Generators;
using WebGrease.Css.Extensions;

namespace MenuApi.Controllers
{
    public class HomeController : Controller
    {
        public ViewResult Index(int? t1, int? t2, int? t3)
        {

           var selections = MenuRepository.GetSelectedNodes( t1, t2, t3);
   
            //one or more navigation items together make up navigation path
            ViewBag.NavigationPath = selections; // menu path, page nav path
            ViewBag.Tier1NodeId = selections.Tier1 != null? selections.Tier1.Id : String.Empty;
            ViewBag.Tier2NodeId = selections.Tier2 != null ? selections.Tier2.Id : String.Empty;
            ViewBag.Tier3NodeId = selections.Tier3 != null ? selections.Tier3.Id : String.Empty;

            var userInfo = MenuRepository.GetUserInformation();

            ViewBag.Name = userInfo.Name;
            ViewBag.Office = userInfo.Office;


            ViewBag.NearbyPages = t3.HasValue ? MenuRepository.GetTierThreeItems(selections.Tier2) : new List<MenuNode>();

            return View(0);
        }
    }

    public class MenuController : Controller
    {
        public JsonResult MenuData()
        {
            var vm = MenuRepository.MenuData;            
            return Json(vm, JsonRequestBehavior.AllowGet);
        }

    }

    public class FlatMenuBarVm
    {
        public IEnumerable<MenuNode> Left;
        public IEnumerable<MenuNode> Middle;
        public Dictionary<string, IEnumerable<MenuNode>> Right;
    }

    public class MenuBarVm
    {
        public string Name { get; set; }
        public string Office { get; set; }

        public IEnumerable<MenuNode> Roots;
    }

    public class SelectedNodes
    {
        public MenuNode Tier1;
        public MenuNode Tier2;
        public MenuNode Tier3;
    }

    public struct UserInformation
    {
        public string Name;
        public string Office;
    }

    public static class MenuRepository
    {
        static MenuRepository()
        {
            //geneate menu, menu items
            var m = new NodeGenerator();
            var rootNodes = m.GenerateTree();

            var roots = rootNodes as IList<MenuNode> ?? rootNodes.ToList();
            var tierOnes = roots.Select(t => new MenuNode(t) { Children = null });
            var tierTwos = roots.SelectMany(t => t.Children).Select(t => new MenuNode(t) { Children = null }).ToList();
            var tierThreeLookup = roots.SelectMany(t => t.Children.Select(n => new { Id = n.Id, Nodes = n.Children }))
                .ToDictionary(t => t.Id, t => t.Nodes);


            //var tierThreeLookup = tierTwos.ToDictionary<MenuNode, string, IEnumerable<MenuNode>>(t => t.Id, t => t.Children.SelectMany(n => n.Children));
            var vm = new FlatMenuBarVm()
            {
                Left = tierOnes,
                Middle = tierTwos,
                Right = tierThreeLookup,
            };

            MenuData = vm;


            //Generate User Information 
            var person = new PersonGenerator().Next();
            var name = String.Format("{0} {1} ", person.FirstName, person.LastName, person.Mail);
            UserInformationCache = new UserInformation() { Name = "Mr " + name + ", Junior Title", Office = "Wing House Express, C-Suite of Sierra Nevada" };
        }

       // public static MenuNode

        public static List<MenuNode> MenuTree { get; set; }
        public static FlatMenuBarVm MenuData { get; private set; }

        public static SelectedNodes GetSelectedNodes(int? t1, int? t2, int? t3)
        {
            MenuNode t1Item = null;
            MenuNode t2Item = null;
            MenuNode t3Item = null;

            if (t1.HasValue)
                t1Item = MenuData.Left.Single(t => t.PageId == t1);

            if (t1Item != null && t2.HasValue)
                t2Item = MenuData.Middle.Single(t => t.PageId == t2);

            if (t2Item != null && t3.HasValue)
                t3Item = MenuData.Right[t2Item.Id].Single(t => t.PageId == t3);

            return new SelectedNodes
                {
                    Tier1 = t1Item,
                    Tier2 = t2Item,
                    Tier3 = t3Item
                };
        }

        public static IEnumerable<MenuNode> GetTierThreeItems(MenuNode t2Item)
        {
            if (t2Item != null && t2Item.Id != null && t2Item.Id != String.Empty)
                return MenuData.Right[t2Item.Id];

            return new List<MenuNode>();
        }

        private static UserInformation UserInformationCache;

        public static UserInformation GetUserInformation()
        {
            return UserInformationCache;
        }
    }

    public class NodeGenerator
    {

        public static int PageId = 1;
        public static string UrlFormat = "Home/Index/?t1={0}&t2={1}&t3={2}";


        // Creates a TextInfo based on the "en-US" culture.
        private TextInfo textInfo;
        private ILoremIpsumGenerator generator;
        private Random random;
        public NodeGenerator(int seed = 1)
        {
            PageId = 1;
            generator = new LoremIpsumGenerator(seed);
            random = new Random(seed);
            textInfo = new CultureInfo("en-US", false).TextInfo;
        }
        
        public MenuNode CreateNode(string parentId = null)
        {
            var id = PageId++;
            return new MenuNode()
            {
               
                Id = "Node_" + (id).ToString(),
                ParentId =  parentId ?? String.Empty,
                Text = textInfo.ToTitleCase(generator.Next(1, 1)).Trim(),
                Url = String.Empty,
                PageId = id
            };
        }

        public string GenerateUrl(int? tier1Id = null, int? tier2Id = null, int? tier3Id = null)
        {
            return String.Format(UrlFormat, tier1Id, tier2Id, tier3Id);
        }
        public IEnumerable<MenuNode> GenerateTree(int numRoots = 8) //depth of 3
        {
            var roots = new List<MenuNode>();
            for (int r = 0; r < numRoots; r++){
                var node = CreateNode();

                //first tier nodes have beween 3 and 10 children which have a small chance of having a url
                node.Children = Enumerable.Repeat(1, random.Next(3,8))
                                .Select(t =>
                                {
                                    var tNode = CreateNode(node.Id);
                                    if (random.NextDouble() < .2)
                                        tNode.Url = GenerateUrl(node.PageId, tNode.PageId, null);

                                    return tNode;
                                }
                                ).ToList();

                node.Children.ForEach(t =>
                {
                    //second tier nodes have children if they dont have no url. Some nodes with urls have children too 
                    if (String.IsNullOrEmpty(t.Url) || random.NextDouble() > .1)
                    {
                        var doChildrenHaveUrls = String.IsNullOrEmpty(t.Url)  || random.NextDouble() > .1;
                        //second tier node have between 4 & 18 children (90%) or 80 and 120 children (10%)
                        t.Children =
                            Enumerable.Repeat(1, random.NextDouble() < .8 ?
                                                 random.Next(4,18) :
                                                 random.Next(80, 120))
                                    .Select(z =>
                                    {
                                        var zNode = CreateNode(t.Id);

                                        if (doChildrenHaveUrls)
                                            zNode.Url = GenerateUrl(node.PageId, t.PageId, zNode.PageId);

                                        return zNode;                                    
                                    }).ToList();
                    } 
                });
                
                roots.Add(node);
            }

            return roots;
        }
    }

    public class MenuNode
    {
        public MenuNode()        {
            Children = new List<MenuNode>();
        }

        public MenuNode(MenuNode m)
        {
            Id = m.Id;
            ParentId = m.ParentId;
            Text = m.Text;
            Url = m.Url;
            Children = m.Children;
            PageId = m.PageId;
        }
       
        public string Id { get; set; }
        public string ParentId { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
        public IEnumerable<MenuNode> Children { get; set; }
        public int PageId { get; set; }

        public override string ToString()
        {
            return String.Format("{0}, {1}, url:{2}", Id, Text, Url);
            //return base.ToString();
        }
    }

}
