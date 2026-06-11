// stores.js — the 58 retailers and their sale-page URLs.
// Keep this in sync with the `STORES` array in public/index.html.
export const STORES = [
  // Department (6)
  { name: "Macy's",                category: 'Department',  url: 'https://www.macys.com/' },
  { name: 'JCPenney',              category: 'Department',  url: 'https://www.jcpenney.com/' },
  { name: 'Belk',                  category: 'Department',  url: 'https://www.belk.com/' },
  { name: 'Nordstrom',             category: 'Department',  url: 'https://www.nordstrom.com/' },
  { name: "Kohl's",                category: 'Department',  url: 'https://www.kohls.com/' },
  { name: "Dillard's",             category: 'Department',  url: 'https://www.dillards.com/' },

  // Apparel (16)
  { name: 'Gap',                   category: 'Apparel',     url: 'https://www.gap.com/' },
  { name: 'Old Navy',              category: 'Apparel',     url: 'https://oldnavy.gap.com/' },
  { name: 'American Eagle',        category: 'Apparel',     url: 'https://www.ae.com/us/en/' },
  { name: 'Hollister',             category: 'Apparel',     url: 'https://www.hollisterco.com/shop/us/' },
  { name: 'Abercrombie & Fitch',   category: 'Apparel',     url: 'https://www.abercrombie.com/shop/us/' },
  { name: 'Aéropostale',           category: 'Apparel',     url: 'https://www.aeropostale.com/' },
  { name: 'Free People',           category: 'Apparel',     url: 'https://www.freepeople.com/' },
  { name: 'H&M',                   category: 'Apparel',     url: 'https://www2.hm.com/en_us/' },
  { name: 'Uniqlo',                category: 'Apparel',     url: 'https://www.uniqlo.com/us/en/' },
  { name: 'Express',               category: 'Apparel',     url: 'https://www.express.com/' },
  { name: 'Buckle',                category: 'Apparel',     url: 'https://www.buckle.com/' },
  { name: 'PacSun',                category: 'Apparel',     url: 'https://www.pacsun.com/' },
  { name: 'Urban Outfitters',      category: 'Apparel',     url: 'https://www.urbanoutfitters.com/' },
  { name: 'Anthropologie',         category: 'Apparel',     url: 'https://www.anthropologie.com/' },
  { name: 'J.Crew',                category: 'Apparel',     url: 'https://www.jcrew.com/' },
  { name: 'Banana Republic',       category: 'Apparel',     url: 'https://bananarepublic.gap.com/' },

  // Athletic (8)
  { name: 'Foot Locker',           category: 'Athletic',    url: 'https://www.footlocker.com/' },
  { name: 'Finish Line',           category: 'Athletic',    url: 'https://www.finishline.com/' },
  { name: 'Champs Sports',         category: 'Athletic',    url: 'https://www.champssports.com/' },
  { name: 'Nike',                  category: 'Athletic',    url: 'https://www.nike.com/' },
  { name: 'Adidas',                category: 'Athletic',    url: 'https://www.adidas.com/us' },
  { name: 'Lululemon',             category: 'Athletic',    url: 'https://shop.lululemon.com/' },
  { name: 'Under Armour',          category: 'Athletic',    url: 'https://www.underarmour.com/en-us/' },
  { name: "Dick's Sporting Goods", category: 'Athletic',    url: 'https://www.dickssportinggoods.com/' },

  // Beauty (5)
  { name: 'Sephora',               category: 'Beauty',      url: 'https://www.sephora.com/' },
  { name: 'Ulta Beauty',           category: 'Beauty',      url: 'https://www.ulta.com/' },
  { name: 'Bath & Body Works',     category: 'Beauty',      url: 'https://www.bathandbodyworks.com/' },
  { name: 'MAC Cosmetics',         category: 'Beauty',      url: 'https://www.maccosmetics.com/' },
  { name: 'The Body Shop',         category: 'Beauty',      url: 'https://us.thebodyshop.com/' },

  // Tech (4)
  { name: 'Apple',                 category: 'Tech',        url: 'https://www.apple.com/' },
  { name: 'Best Buy',              category: 'Tech',        url: 'https://www.bestbuy.com/' },
  { name: 'GameStop',              category: 'Tech',        url: 'https://www.gamestop.com/' },
  { name: 'Microsoft Store',       category: 'Tech',        url: 'https://www.microsoft.com/en-us/store/' },

  // Jewelry (3)
  { name: 'Pandora',               category: 'Jewelry',     url: 'https://us.pandora.net/' },
  { name: 'Kay Jewelers',          category: 'Jewelry',     url: 'https://www.kay.com/' },
  { name: 'Zales',                 category: 'Jewelry',     url: 'https://www.zales.com/' },

  // Accessories (2)
  { name: "Claire's",              category: 'Accessories', url: 'https://www.claires.com/us/' },
  { name: 'Sunglass Hut',          category: 'Accessories', url: 'https://www.sunglasshut.com/us/' },

  // Home (4)
  { name: 'Pottery Barn',          category: 'Home',        url: 'https://www.potterybarn.com/' },
  { name: 'Williams Sonoma',       category: 'Home',        url: 'https://www.williams-sonoma.com/' },
  { name: 'Crate & Barrel',        category: 'Home',        url: 'https://www.crateandbarrel.com/' },
  { name: 'Yankee Candle',         category: 'Home',        url: 'https://www.yankeecandle.com/' },

  // Shoes (5)
  { name: 'DSW',                   category: 'Shoes',       url: 'https://www.dsw.com/' },
  { name: 'Famous Footwear',       category: 'Shoes',       url: 'https://www.famousfootwear.com/' },
  { name: 'Journeys',              category: 'Shoes',       url: 'https://www.journeys.com/' },
  { name: 'Vans',                  category: 'Shoes',       url: 'https://www.vans.com/' },
  { name: 'Crocs',                 category: 'Shoes',       url: 'https://www.crocs.com/' },

  // Specialty (4)
  { name: 'LEGO',                  category: 'Specialty',   url: 'https://www.lego.com/en-us' },
  { name: 'Disney Store',          category: 'Specialty',   url: 'https://www.shopdisney.com/' },
  { name: 'Hot Topic',             category: 'Specialty',   url: 'https://www.hottopic.com/' },
  { name: "Build-A-Bear Workshop",             category: 'Specialty',   url: 'https://www.buildabear.com/' },

  // Books & Fun (1)
  { name: 'Barnes & Noble',        category: 'Books & Fun', url: 'https://www.barnesandnoble.com/' },
];
