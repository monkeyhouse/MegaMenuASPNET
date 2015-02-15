using System.Web.Optimization;

namespace MenuApi
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/app/scripts")
                .Include("~/app/libs/Jquery/jquery-2.1.3.js",
                         "~/app/libs/Semantic/semantic.js",
                         "~/app/libs/Jquery/Plugins/menuAim.js",
                         "~/app/libs/Jquery/Plugins/jquery.mousewheel.js",                         
                         "~/app/libs/Jquery/Plugins/jquery.typeWatch.js",
                         "~/app/menu/mmCache.js",
                         "~/app/menu/mmCtrl.js"));

            bundles.Add(new StyleBundle("~/app/styles").Include(
                                        "~/app/libs/Semantic/semantic.css",
                                        "~/app/menu/layout.css",
                                        "~/app/menu/temp.css"));

            BundleTable.EnableOptimizations = true;
            /* //add link to jquery on the CDN
    var jqueryCdnPath = "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.1.min.js";

    bundles.Add(new ScriptBundle("~/bundles/jquery",
                jqueryCdnPath).Include(
                "~/Scripts/jquery-{version}.js"));*/

        }
    }
}