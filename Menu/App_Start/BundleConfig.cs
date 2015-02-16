using System.Web.Optimization;

namespace MenuApi
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/app/desktopscripts")
                .Include("~/app/libs/Jquery/jquery-2.1.3.js",
                         "~/app/libs/Semantic/semantic.js",
                         "~/app/libs/Jquery/Plugins/menuAim.js",
                         "~/app/libs/Jquery/Plugins/jquery.mousewheel.js",                         
                         "~/app/menu/mmCache.js",
                         "~/app/menu/mmCtrl.js"));

            bundles.Add(new StyleBundle("~/app/desktopstyles").Include(
                                        "~/app/libs/Semantic/semantic.css",
                                        "~/app/styles/site.css"));


            #region mobile
            bundles.Add(new StyleBundle("~/app/mobilestyles").Include(
                            "~/app/libs/Semantic/semantic.css",
                            "~/app/styles/mobile/site.css",
                            "~/app/libs/select2/select2.css"));

            bundles.Add(new ScriptBundle("~/app/mobilescripts")
               .Include("~/app/libs/Jquery/jquery-2.1.3.js",
                   "~/app/libs/Semantic/semantic.js",
                   "~/app/libs/select2/select2.js",
                   "~/app/menu/mobile/mmCache.js",
                   "~/app/menu/mobile/mmCtrl.js"));


            #endregion mobile

            BundleTable.EnableOptimizations = true;
            /* //add link to jquery on the CDN
    var jqueryCdnPath = "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.7.1.min.js";

    bundles.Add(new ScriptBundle("~/bundles/jquery",
                jqueryCdnPath).Include(
                "~/Scripts/jquery-{version}.js"));*/

        }
    }
}