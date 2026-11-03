(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Unicode font maps.
   * Each style supplies the 26 uppercase and 26 lowercase glyphs (and
   * optional digits) so we can build a per-character lookup table.
   * ------------------------------------------------------------------ */

  var UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var LOWER = "abcdefghijklmnopqrstuvwxyz";
  var DIGITS = "0123456789";

  function buildMap(upper, lower, digits) {
    var map = {};
    var u = Array.from(upper || "");
    var l = Array.from(lower || upper || "");
    var d = Array.from(digits || "");
    for (var i = 0; i < 26; i++) {
      if (u[i]) { map[UPPER[i]] = u[i]; }
      if (l[i]) { map[LOWER[i]] = l[i]; }
    }
    for (var j = 0; j < 10; j++) {
      if (d[j]) { map[DIGITS[j]] = d[j]; }
    }
    return map;
  }

  var STYLES = [
    {
      name: "Bold",
      category: "bold",
      map: buildMap(
        "\u{1D400}\u{1D401}\u{1D402}\u{1D403}\u{1D404}\u{1D405}\u{1D406}\u{1D407}\u{1D408}\u{1D409}\u{1D40A}\u{1D40B}\u{1D40C}\u{1D40D}\u{1D40E}\u{1D40F}\u{1D410}\u{1D411}\u{1D412}\u{1D413}\u{1D414}\u{1D415}\u{1D416}\u{1D417}\u{1D418}\u{1D419}",
        "\u{1D41A}\u{1D41B}\u{1D41C}\u{1D41D}\u{1D41E}\u{1D41F}\u{1D420}\u{1D421}\u{1D422}\u{1D423}\u{1D424}\u{1D425}\u{1D426}\u{1D427}\u{1D428}\u{1D429}\u{1D42A}\u{1D42B}\u{1D42C}\u{1D42D}\u{1D42E}\u{1D42F}\u{1D430}\u{1D431}\u{1D432}\u{1D433}",
        "\u{1D7CE}\u{1D7CF}\u{1D7D0}\u{1D7D1}\u{1D7D2}\u{1D7D3}\u{1D7D4}\u{1D7D5}\u{1D7D6}\u{1D7D7}"
      )
    },
    {
      name: "Italic",
      category: "italic",
      map: buildMap(
        "\u{1D434}\u{1D435}\u{1D436}\u{1D437}\u{1D438}\u{1D439}\u{1D43A}\u{1D43B}\u{1D43C}\u{1D43D}\u{1D43E}\u{1D43F}\u{1D440}\u{1D441}\u{1D442}\u{1D443}\u{1D444}\u{1D445}\u{1D446}\u{1D447}\u{1D448}\u{1D449}\u{1D44A}\u{1D44B}\u{1D44C}\u{1D44D}",
        "\u{1D44E}\u{1D44F}\u{1D450}\u{1D451}\u{1D452}\u{1D453}\u{1D454}\u{210E}\u{1D456}\u{1D457}\u{1D458}\u{1D459}\u{1D45A}\u{1D45B}\u{1D45C}\u{1D45D}\u{1D45E}\u{1D45F}\u{1D460}\u{1D461}\u{1D462}\u{1D463}\u{1D464}\u{1D465}\u{1D466}\u{1D467}"
      )
    },
    {
      name: "Bold Italic",
      category: "italic",
      map: buildMap(
        "\u{1D468}\u{1D469}\u{1D46A}\u{1D46B}\u{1D46C}\u{1D46D}\u{1D46E}\u{1D46F}\u{1D470}\u{1D471}\u{1D472}\u{1D473}\u{1D474}\u{1D475}\u{1D476}\u{1D477}\u{1D478}\u{1D479}\u{1D47A}\u{1D47B}\u{1D47C}\u{1D47D}\u{1D47E}\u{1D47F}\u{1D480}\u{1D481}",
        "\u{1D482}\u{1D483}\u{1D484}\u{1D485}\u{1D486}\u{1D487}\u{1D488}\u{1D489}\u{1D48A}\u{1D48B}\u{1D48C}\u{1D48D}\u{1D48E}\u{1D48F}\u{1D490}\u{1D491}\u{1D492}\u{1D493}\u{1D494}\u{1D495}\u{1D496}\u{1D497}\u{1D498}\u{1D499}\u{1D49A}\u{1D49B}"
      )
    },
    {
      name: "Bold Sans",
      category: "bold",
      map: buildMap(
        "\u{1D5D4}\u{1D5D5}\u{1D5D6}\u{1D5D7}\u{1D5D8}\u{1D5D9}\u{1D5DA}\u{1D5DB}\u{1D5DC}\u{1D5DD}\u{1D5DE}\u{1D5DF}\u{1D5E0}\u{1D5E1}\u{1D5E2}\u{1D5E3}\u{1D5E4}\u{1D5E5}\u{1D5E6}\u{1D5E7}\u{1D5E8}\u{1D5E9}\u{1D5EA}\u{1D5EB}\u{1D5EC}\u{1D5ED}",
        "\u{1D5EE}\u{1D5EF}\u{1D5F0}\u{1D5F1}\u{1D5F2}\u{1D5F3}\u{1D5F4}\u{1D5F5}\u{1D5F6}\u{1D5F7}\u{1D5F8}\u{1D5F9}\u{1D5FA}\u{1D5FB}\u{1D5FC}\u{1D5FD}\u{1D5FE}\u{1D5FF}\u{1D600}\u{1D601}\u{1D602}\u{1D603}\u{1D604}\u{1D605}\u{1D606}\u{1D607}",
        "\u{1D7EC}\u{1D7ED}\u{1D7EE}\u{1D7EF}\u{1D7F0}\u{1D7F1}\u{1D7F2}\u{1D7F3}\u{1D7F4}\u{1D7F5}"
      )
    },
    {
      name: "Italic Sans",
      category: "italic",
      map: buildMap(
        "\u{1D608}\u{1D609}\u{1D60A}\u{1D60B}\u{1D60C}\u{1D60D}\u{1D60E}\u{1D60F}\u{1D610}\u{1D611}\u{1D612}\u{1D613}\u{1D614}\u{1D615}\u{1D616}\u{1D617}\u{1D618}\u{1D619}\u{1D61A}\u{1D61B}\u{1D61C}\u{1D61D}\u{1D61E}\u{1D61F}\u{1D620}\u{1D621}",
        "\u{1D622}\u{1D623}\u{1D624}\u{1D625}\u{1D626}\u{1D627}\u{1D628}\u{1D629}\u{1D62A}\u{1D62B}\u{1D62C}\u{1D62D}\u{1D62E}\u{1D62F}\u{1D630}\u{1D631}\u{1D632}\u{1D633}\u{1D634}\u{1D635}\u{1D636}\u{1D637}\u{1D638}\u{1D639}\u{1D63A}\u{1D63B}"
      )
    },
    {
      name: "Bold Italic Sans",
      category: "italic",
      map: buildMap(
        "\u{1D63C}\u{1D63D}\u{1D63E}\u{1D63F}\u{1D640}\u{1D641}\u{1D642}\u{1D643}\u{1D644}\u{1D645}\u{1D646}\u{1D647}\u{1D648}\u{1D649}\u{1D64A}\u{1D64B}\u{1D64C}\u{1D64D}\u{1D64E}\u{1D64F}\u{1D650}\u{1D651}\u{1D652}\u{1D653}\u{1D654}\u{1D655}",
        "\u{1D656}\u{1D657}\u{1D658}\u{1D659}\u{1D65A}\u{1D65B}\u{1D65C}\u{1D65D}\u{1D65E}\u{1D65F}\u{1D660}\u{1D661}\u{1D662}\u{1D663}\u{1D664}\u{1D665}\u{1D666}\u{1D667}\u{1D668}\u{1D669}\u{1D66A}\u{1D66B}\u{1D66C}\u{1D66D}\u{1D66E}\u{1D66F}"
      )
    },
    {
      name: "Monospace",
      category: "mono",
      map: buildMap(
        "\u{1D670}\u{1D671}\u{1D672}\u{1D673}\u{1D674}\u{1D675}\u{1D676}\u{1D677}\u{1D678}\u{1D679}\u{1D67A}\u{1D67B}\u{1D67C}\u{1D67D}\u{1D67E}\u{1D67F}\u{1D680}\u{1D681}\u{1D682}\u{1D683}\u{1D684}\u{1D685}\u{1D686}\u{1D687}\u{1D688}\u{1D689}",
        "\u{1D68A}\u{1D68B}\u{1D68C}\u{1D68D}\u{1D68E}\u{1D68F}\u{1D690}\u{1D691}\u{1D692}\u{1D693}\u{1D694}\u{1D695}\u{1D696}\u{1D697}\u{1D698}\u{1D699}\u{1D69A}\u{1D69B}\u{1D69C}\u{1D69D}\u{1D69E}\u{1D69F}\u{1D6A0}\u{1D6A1}\u{1D6A2}\u{1D6A3}",
        "\u{1D7F6}\u{1D7F7}\u{1D7F8}\u{1D7F9}\u{1D7FA}\u{1D7FB}\u{1D7FC}\u{1D7FD}\u{1D7FE}\u{1D7FF}"
      )
    },
    {
      name: "Script",
      category: "italic",
      map: buildMap(
        "\u{1D49C}\u{212C}\u{1D49E}\u{1D49F}\u{2130}\u{2131}\u{1D4A2}\u{210B}\u{2110}\u{1D4A5}\u{1D4A6}\u{2112}\u{2133}\u{1D4A9}\u{1D4AA}\u{1D4AB}\u{1D4AC}\u{211B}\u{1D4AE}\u{1D4AF}\u{1D4B0}\u{1D4B1}\u{1D4B2}\u{1D4B3}\u{1D4B4}\u{1D4B5}",
        "\u{1D4B6}\u{1D4B7}\u{1D4B8}\u{1D4B9}\u{212F}\u{1D4BB}\u{210A}\u{1D4BD}\u{1D4BE}\u{1D4BF}\u{1D4C0}\u{1D4C1}\u{1D4C2}\u{1D4C3}\u{2134}\u{1D4C5}\u{1D4C6}\u{1D4C7}\u{1D4C8}\u{1D4C9}\u{1D4CA}\u{1D4CB}\u{1D4CC}\u{1D4CD}\u{1D4CE}\u{1D4CF}"
      )
    },
    {
      name: "Bold Script",
      category: "italic",
      map: buildMap(
        "\u{1D4D0}\u{1D4D1}\u{1D4D2}\u{1D4D3}\u{1D4D4}\u{1D4D5}\u{1D4D6}\u{1D4D7}\u{1D4D8}\u{1D4D9}\u{1D4DA}\u{1D4DB}\u{1D4DC}\u{1D4DD}\u{1D4DE}\u{1D4DF}\u{1D4E0}\u{1D4E1}\u{1D4E2}\u{1D4E3}\u{1D4E4}\u{1D4E5}\u{1D4E6}\u{1D4E7}\u{1D4E8}\u{1D4E9}",
        "\u{1D4EA}\u{1D4EB}\u{1D4EC}\u{1D4ED}\u{1D4EE}\u{1D4EF}\u{1D4F0}\u{1D4F1}\u{1D4F2}\u{1D4F3}\u{1D4F4}\u{1D4F5}\u{1D4F6}\u{1D4F7}\u{1D4F8}\u{1D4F9}\u{1D4FA}\u{1D4FB}\u{1D4FC}\u{1D4FD}\u{1D4FE}\u{1D4FF}\u{1D500}\u{1D501}\u{1D502}\u{1D503}"
      )
    },
    {
      name: "Fraktur",
      category: "gothic",
      map: buildMap(
        "\u{1D504}\u{1D505}\u{212D}\u{1D507}\u{1D508}\u{1D509}\u{1D50A}\u{210C}\u{2111}\u{1D50D}\u{1D50E}\u{1D50F}\u{1D510}\u{1D511}\u{1D512}\u{1D513}\u{1D514}\u{211C}\u{1D516}\u{1D517}\u{1D518}\u{1D519}\u{1D51A}\u{1D51B}\u{1D51C}\u{2128}",
        "\u{1D51E}\u{1D51F}\u{1D520}\u{1D521}\u{1D522}\u{1D523}\u{1D524}\u{1D525}\u{1D526}\u{1D527}\u{1D528}\u{1D529}\u{1D52A}\u{1D52B}\u{1D52C}\u{1D52D}\u{1D52E}\u{1D52F}\u{1D530}\u{1D531}\u{1D532}\u{1D533}\u{1D534}\u{1D535}\u{1D536}\u{1D537}"
      )
    },
    {
      name: "Bold Fraktur",
      category: "gothic",
      map: buildMap(
        "\u{1D56C}\u{1D56D}\u{1D56E}\u{1D56F}\u{1D570}\u{1D571}\u{1D572}\u{1D573}\u{1D574}\u{1D575}\u{1D576}\u{1D577}\u{1D578}\u{1D579}\u{1D57A}\u{1D57B}\u{1D57C}\u{1D57D}\u{1D57E}\u{1D57F}\u{1D580}\u{1D581}\u{1D582}\u{1D583}\u{1D584}\u{1D585}",
        "\u{1D586}\u{1D587}\u{1D588}\u{1D589}\u{1D58A}\u{1D58B}\u{1D58C}\u{1D58D}\u{1D58E}\u{1D58F}\u{1D590}\u{1D591}\u{1D592}\u{1D593}\u{1D594}\u{1D595}\u{1D596}\u{1D597}\u{1D598}\u{1D599}\u{1D59A}\u{1D59B}\u{1D59C}\u{1D59D}\u{1D59E}\u{1D59F}"
      )
    },
    {
      name: "Double-Struck",
      category: "decorated",
      map: buildMap(
        "\u{1D538}\u{1D539}\u{2102}\u{1D53B}\u{1D53C}\u{1D53D}\u{1D53E}\u{210D}\u{1D540}\u{1D541}\u{1D542}\u{1D543}\u{1D544}\u{2115}\u{1D546}\u{2119}\u{211A}\u{211D}\u{1D54A}\u{1D54B}\u{1D54C}\u{1D54D}\u{1D54E}\u{1D54F}\u{1D550}\u{2124}",
        "\u{1D552}\u{1D553}\u{1D554}\u{1D555}\u{1D556}\u{1D557}\u{1D558}\u{1D559}\u{1D55A}\u{1D55B}\u{1D55C}\u{1D55D}\u{1D55E}\u{1D55F}\u{1D560}\u{1D561}\u{1D562}\u{1D563}\u{1D564}\u{1D565}\u{1D566}\u{1D567}\u{1D568}\u{1D569}\u{1D56A}\u{1D56B}",
        "\u{1D7D8}\u{1D7D9}\u{1D7DA}\u{1D7DB}\u{1D7DC}\u{1D7DD}\u{1D7DE}\u{1D7DF}\u{1D7E0}\u{1D7E1}"
      )
    },
    {
      name: "Circled",
      category: "decorated",
      map: buildMap(
        "\u24B6\u24B7\u24B8\u24B9\u24BA\u24BB\u24BC\u24BD\u24BE\u24BF\u24C0\u24C1\u24C2\u24C3\u24C4\u24C5\u24C6\u24C7\u24C8\u24C9\u24CA\u24CB\u24CC\u24CD\u24CE\u24CF",
        "\u24D0\u24D1\u24D2\u24D3\u24D4\u24D5\u24D6\u24D7\u24D8\u24D9\u24DA\u24DB\u24DC\u24DD\u24DE\u24DF\u24E0\u24E1\u24E2\u24E3\u24E4\u24E5\u24E6\u24E7\u24E8\u24E9",
        "\u24EA\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468"
      )
    },
    {
      name: "Negative Circled",
      category: "decorated",
      map: buildMap(
        "\u{1F150}\u{1F151}\u{1F152}\u{1F153}\u{1F154}\u{1F155}\u{1F156}\u{1F157}\u{1F158}\u{1F159}\u{1F15A}\u{1F15B}\u{1F15C}\u{1F15D}\u{1F15E}\u{1F15F}\u{1F160}\u{1F161}\u{1F162}\u{1F163}\u{1F164}\u{1F165}\u{1F166}\u{1F167}\u{1F168}\u{1F169}",
        "\u{1F150}\u{1F151}\u{1F152}\u{1F153}\u{1F154}\u{1F155}\u{1F156}\u{1F157}\u{1F158}\u{1F159}\u{1F15A}\u{1F15B}\u{1F15C}\u{1F15D}\u{1F15E}\u{1F15F}\u{1F160}\u{1F161}\u{1F162}\u{1F163}\u{1F164}\u{1F165}\u{1F166}\u{1F167}\u{1F168}\u{1F169}",
        "\u24FF\u2776\u2777\u2778\u2779\u277A\u277B\u277C\u277D\u277E"
      )
    },
    {
      name: "Squared",
      category: "decorated",
      map: buildMap(
        "\u{1F130}\u{1F131}\u{1F132}\u{1F133}\u{1F134}\u{1F135}\u{1F136}\u{1F137}\u{1F138}\u{1F139}\u{1F13A}\u{1F13B}\u{1F13C}\u{1F13D}\u{1F13E}\u{1F13F}\u{1F140}\u{1F141}\u{1F142}\u{1F143}\u{1F144}\u{1F145}\u{1F146}\u{1F147}\u{1F148}\u{1F149}"
      )
    },
    {
      name: "Parenthesized",
      category: "decorated",
      map: buildMap(
        "\u{1F110}\u{1F111}\u{1F112}\u{1F113}\u{1F114}\u{1F115}\u{1F116}\u{1F117}\u{1F118}\u{1F119}\u{1F11A}\u{1F11B}\u{1F11C}\u{1F11D}\u{1F11E}\u{1F11F}\u{1F120}\u{1F121}\u{1F122}\u{1F123}\u{1F124}\u{1F125}\u{1F126}\u{1F127}\u{1F128}\u{1F129}",
        "\u249C\u249D\u249E\u249F\u24A0\u24A1\u24A2\u24A3\u24A4\u24A5\u24A6\u24A7\u24A8\u24A9\u24AA\u24AB\u24AC\u24AD\u24AE\u24AF\u24B0\u24B1\u24B2\u24B3\u24B4\u24B5"
      )
    },
    {
      name: "Fullwidth",
      category: "decorated",
      map: buildMap(
        "\uFF21\uFF22\uFF23\uFF24\uFF25\uFF26\uFF27\uFF28\uFF29\uFF2A\uFF2B\uFF2C\uFF2D\uFF2E\uFF2F\uFF30\uFF31\uFF32\uFF33\uFF34\uFF35\uFF36\uFF37\uFF38\uFF39\uFF3A",
        "\uFF41\uFF42\uFF43\uFF44\uFF45\uFF46\uFF47\uFF48\uFF49\uFF4A\uFF4B\uFF4C\uFF4D\uFF4E\uFF4F\uFF50\uFF51\uFF52\uFF53\uFF54\uFF55\uFF56\uFF57\uFF58\uFF59\uFF5A",
        "\uFF10\uFF11\uFF12\uFF13\uFF14\uFF15\uFF16\uFF17\uFF18\uFF19"
      )
    },
    {
      name: "Small Caps",
      category: "decorated",
      map: buildMap(
        "\u1D00\u0299\u1D04\u1D05\u1D07\uA730\u0262\u029C\u026A\u1D0A\u1D0B\u029F\u1D0D\u0274\u1D0F\u1D18\u01EB\u0280\uA731\u1D1B\u1D1C\u1D20\u1D21\u02E3\u028F\u1D22",
        "\u1D00\u0299\u1D04\u1D05\u1D07\uA730\u0262\u029C\u026A\u1D0A\u1D0B\u029F\u1D0D\u0274\u1D0F\u1D18\u01EB\u0280\uA731\u1D1B\u1D1C\u1D20\u1D21\u02E3\u028F\u1D22"
      )
    },
    {
      name: "Superscript",
      category: "decorated",
      map: buildMap(
        "\u1D2C\u1D2E\u1D9C\u1D30\u1D31\u1DA0\u1D33\u02B0\u2071\u02B2\u1D37\u02E1\u1D39\u207F\u1D52\u1D56\u1D5B\u02B3\u02E2\u1D57\u1D58\u1D5B\u02B7\u02E3\u02B8\u1D5B",
        "\u1D43\u1D47\u1D9C\u1D48\u1D49\u1DA0\u1D4D\u02B0\u2071\u02B2\u1D4F\u02E1\u1D50\u207F\u1D52\u1D56\u02B3\u02E2\u1D57\u1D58\u1D5B\u02B7\u02E3\u02B8\u1D5B",
        "\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079"
      )
    },
    {
      name: "Subscript",
      category: "decorated",
      map: buildMap(
        "\u1D2C\u0299\u1D04\u1D05\u1D07\u1DA0\u0262\u029C\u026A\u2C7C\u1D0B\u029F\u1D0D\u0274\u1D0F\u1D18\u1D0F\u0280\u209B\u209C\u1D64\u1D65\u1D21\u2093\u028F\u1D22",
        "\u2090\u2091\u2095\u1D62\u2C7C\u2096\u2097\u2098\u2099\u2092\u209A\u1D63\u209B\u209C\u1D64\u1D65\u2093",
        "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089"
      )
    },
    {
      name: "Upside Down",
      category: "decorated",
      reverse: true,
      map: buildMap(
        "\u2200\u{1F141}\uA73F\u2144\u018E\u2132\u2141\u0048\u0049\u017F\u029E\u02E5\u0057\u004E\u004F\u2140\u03D9\u1D1A\u0053\u22A5\u2229\u039B\u0057\u0058\u2144\u005A",
        "\u0250\u0071\u0254\u0070\u01DD\u025F\u0183\u0265\u1D09\u027E\u029E\u006C\u026F\u0075\u006F\u0064\u0062\u0279\u0073\u0287\u028C\u028C\u028D\u0078\u028E\u007A",
        "\u0030\u0196\u0141\u0190\u10E3\u03DB\u0039\u2142\u0038\u0036"
      )
    }
  ];

  /* ------------------------------------------------------------------ *
   * DOM references
   * ------------------------------------------------------------------ */

  var textInput = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var categorySelect = document.getElementById("categorySelect");
  var searchStyle = document.getElementById("searchStyle");
  var limitToggle = document.getElementById("limitToggle");
  var results = document.getElementById("results");
  var emptyState = document.getElementById("emptyState");
  var alertBox = document.getElementById("alertBox");
  var copyFirst = document.getElementById("copyFirst");
  var clearBtn = document.getElementById("clearBtn");
  var copyStatus = document.getElementById("copyStatus");
  var chart = document.getElementById("chart");
  var chartEmpty = document.getElementById("chartEmpty");

  var USERNAME_LIMIT = 30;
  var MAX_INPUT = 300;
  var current = [];

  /* ------------------------------------------------------------------ *
   * Conversion
   * ------------------------------------------------------------------ */

  function convert(text, style) {
    var chars = Array.from(text);
    var out = chars.map(function (ch) {
      return Object.prototype.hasOwnProperty.call(style.map, ch) ? style.map[ch] : ch;
    });
    if (style.reverse) { out.reverse(); }
    return out.join("");
  }

  function selectedStyles() {
    var cat = categorySelect.value;
    var term = searchStyle.value.trim().toLowerCase();
    return STYLES.filter(function (style) {
      var catOk = cat === "all" || style.category === cat;
      var termOk = !term || style.name.toLowerCase().indexOf(term) !== -1;
      return catOk && termOk;
    });
  }

  function render() {
    var text = textInput.value;
    charCount.textContent = String(Array.from(text).length);

    if (!text.trim()) {
      results.innerHTML = "";
      emptyState.classList.remove("d-none");
      alertBox.classList.add("d-none");
      current = [];
      renderChart([]);
      return;
    }

    emptyState.classList.add("d-none");

    var styles = selectedStyles();
    if (!styles.length) {
      results.innerHTML = "";
      alertBox.textContent = "No styles match that filter. Try another word or switch back to \u201cAll styles\u201d.";
      alertBox.classList.remove("d-none");
      current = [];
      renderChart([]);
      return;
    }
    alertBox.classList.add("d-none");

    var frag = document.createDocumentFragment();
    current = styles.map(function (style, index) {
      var value = convert(text, style);
      var length = Array.from(value).length;
      var fits = length <= USERNAME_LIMIT;
      var row = document.createElement("div");
      row.className = "result-row";
      row.setAttribute("tabindex", "0");
      row.setAttribute("role", "button");
      row.setAttribute("aria-label", "Copy " + style.name + " version: " + value);
      if (limitToggle.checked && fits) { row.classList.add("fits"); }
      row.innerHTML =
        '<div class="d-flex justify-content-between align-items-start">' +
          '<div class="result-name">' + escapeHtml(style.name) + '</div>' +
          '<div class="copy-hint">Copy</div>' +
        '</div>' +
        '<p class="result-value">' + escapeHtml(value) + '</p>' +
        '<div class="result-meta">' + length + ' characters' +
          (limitToggle.checked ? (fits ? ' \u00b7 fits a 30-char username' : ' \u00b7 over 30-char username limit') : '') +
        '</div>';
      row.addEventListener("click", function () { copyValue(value, row); });
      row.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          copyValue(value, row);
        }
      });
      frag.appendChild(row);
      return { name: style.name, value: value, length: length, fits: fits, index: index };
    });

    results.innerHTML = "";
    results.appendChild(frag);
    renderChart(current);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------------ *
   * Clipboard
   * ------------------------------------------------------------------ */

  function copyValue(value, row) {
    var done = function (ok) {
      if (ok) {
        copyStatus.textContent = "Copied to clipboard!";
        row.classList.add("copied");
        window.setTimeout(function () { row.classList.remove("copied"); }, 1200);
      } else {
        copyStatus.textContent = "Copy failed \u2014 select the text and copy manually.";
      }
      window.setTimeout(function () { copyStatus.textContent = ""; }, 2500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(fallbackCopy(value)); });
    } else {
      done(fallbackCopy(value));
    }
  }

  function fallbackCopy(value) {
    var area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  /* ------------------------------------------------------------------ *
   * Length chart
   * ------------------------------------------------------------------ */

  function renderChart(items) {
    if (!items.length) {
      chart.innerHTML = "";
      chartEmpty.classList.remove("d-none");
      return;
    }
    chartEmpty.classList.add("d-none");

    var sorted = items.slice().sort(function (a, b) { return b.length - a.length; }).slice(0, 8);
    var max = sorted[0].length || 1;
    var rows = sorted.map(function (item) {
      var pct = Math.max(4, Math.round((item.length / max) * 100));
      var accent = limitToggle.checked && item.fits ? " is-accent" : "";
      return '<div class="chart-row">' +
        '<div class="chart-label" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>' +
        '<div class="chart-track"><div class="chart-bar' + accent + '" style="width:' + pct + '%"></div></div>' +
        '<div class="chart-value">' + item.length + '</div>' +
      '</div>';
    }).join("");
    chart.innerHTML = rows;
  }

  /* ------------------------------------------------------------------ *
   * Events
   * ------------------------------------------------------------------ */

  textInput.addEventListener("input", render);
  categorySelect.addEventListener("change", render);
  searchStyle.addEventListener("input", render);
  limitToggle.addEventListener("change", render);

  copyFirst.addEventListener("click", function () {
    if (!current.length) {
      copyStatus.textContent = "Enter some text first.";
      window.setTimeout(function () { copyStatus.textContent = ""; }, 2000);
      return;
    }
    var row = results.querySelector(".result-row");
    copyValue(current[0].value, row || document.createElement("div"));
  });

  clearBtn.addEventListener("click", function () {
    textInput.value = "";
    searchStyle.value = "";
    categorySelect.value = "all";
    limitToggle.checked = false;
    textInput.focus();
    render();
  });

  render();
})();
