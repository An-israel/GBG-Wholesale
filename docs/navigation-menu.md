# The Shop menu

Build this once in **Shopify admin > Content > Navigation**, then pick it in the
theme editor under **Header > Shop > Menu to show**.

Two things are deliberately different here, and both matter for search:

- The **menu label** is short, because that is what fits in a menu and what a
  shopper scans for.
- The **collection title** is the explicit version, because that becomes the
  page's H1 and is what Google reads.

You do not type the collection titles anywhere: the setup script already set
them. In Navigation you only set the short labels below.

## Menu name

Create a menu called **Shop menu** with handle `shop-menu`.

## Structure

### Top level

- **All Products** -> `/collections/all`  
  <sub>page H1: All Wholesale Products</sub>
- **New Arrivals** -> `/collections/new-arrivals`  
  <sub>page H1: New Wholesale Stock UK</sub>
- **Best Sellers** -> `/collections/best-sellers`  
  <sub>page H1: Best Selling Wholesale Products UK</sub>
- **Jewellery & Accessories** -> `/collections/jewellery-accessories`  
  <sub>page H1: Wholesale Jewellery & Accessories UK</sub>
  - **Necklaces** -> `/collections/necklaces`  
    <sub>page H1: Wholesale Necklaces UK</sub>
  - **Earrings** -> `/collections/earrings`  
    <sub>page H1: Wholesale Earrings UK</sub>
  - **Bracelets** -> `/collections/bracelets`  
    <sub>page H1: Wholesale Bracelets UK</sub>
  - **Rings** -> `/collections/rings`  
    <sub>page H1: Wholesale Rings UK</sub>
  - **Jewellery Sets** -> `/collections/jewellery-sets`  
    <sub>page H1: Wholesale Jewellery Sets UK</sub>
  - **Jewellery Starter Box** -> `/collections/jewellery-starter-box`  
    <sub>page H1: Jewellery Starter Box UK</sub>
- **Bags** -> `/collections/bags`  
  <sub>page H1: Wholesale Bags UK for Resellers</sub>
  - **Fashion Bags** -> `/collections/fashion-bags`  
    <sub>page H1: Wholesale Fashion Bags UK</sub>
  - **Handbags** -> `/collections/handbags`  
    <sub>page H1: Wholesale Handbags UK</sub>
  - **School Bags** -> `/collections/school-bags`  
    <sub>page H1: Wholesale School Bags UK</sub>
  - **Wallets** -> `/collections/wallets`  
    <sub>page H1: Wholesale Wallets UK</sub>
  - **Travel Bags** -> `/collections/travel-bags`  
    <sub>page H1: Wholesale Travel Bags UK</sub>
- **Clothing** -> `/collections/clothing`  
  <sub>page H1: Wholesale Clothing UK for Resellers</sub>
  - **Women's Clothing** -> `/collections/womens-clothing`  
    <sub>page H1: Wholesale Women's Clothing UK</sub>
  - **Casualwear** -> `/collections/casualwear`  
    <sub>page H1: Wholesale Casualwear UK</sub>
  - **Knitwear** -> `/collections/knitwear`  
    <sub>page H1: Wholesale Knitwear UK</sub>
  - **Seasonal Clothing** -> `/collections/seasonal-clothing`  
    <sub>page H1: Wholesale Seasonal Clothing UK</sub>
  - **Mixed Clothing Packs** -> `/collections/mixed-clothing-packs`  
    <sub>page H1: Wholesale Mixed Clothing Packs UK</sub>
- **Beauty & Fragrance** -> `/collections/beauty-fragrance`  
  <sub>page H1: Wholesale Beauty & Fragrance UK</sub>
  - **Perfumes** -> `/collections/perfumes`  
    <sub>page H1: Wholesale Perfumes UK</sub>
  - **Mini Perfumes** -> `/collections/mini-perfumes`  
    <sub>page H1: Wholesale Mini Perfumes UK</sub>
  - **Beauty Accessories** -> `/collections/beauty-accessories`  
    <sub>page H1: Wholesale Beauty Accessories UK</sub>
  - **Personal Care** -> `/collections/personal-care`  
    <sub>page H1: Wholesale Personal Care Products UK</sub>
- **Electronics & Gadgets** -> `/collections/electronics`  
  <sub>page H1: Wholesale Electronics & Gadgets UK</sub>
  - **Fans** -> `/collections/fans`  
    <sub>page H1: Wholesale Fans UK</sub>
  - **Speakers** -> `/collections/speakers`  
    <sub>page H1: Wholesale Speakers UK</sub>
  - **Phone Accessories** -> `/collections/phone-accessories`  
    <sub>page H1: Wholesale Phone Accessories UK</sub>
  - **Small Electronics** -> `/collections/small-electronics`  
    <sub>page H1: Wholesale Small Electronics UK</sub>
  - **Home Gadgets** -> `/collections/home-gadgets`  
    <sub>page H1: Wholesale Home Gadgets UK</sub>
- **Home & Lifestyle** -> `/collections/home-lifestyle`  
  <sub>page H1: Wholesale Home & Lifestyle UK</sub>
  - **Kitchenware** -> `/collections/kitchenware`  
    <sub>page H1: Wholesale Kitchenware UK</sub>
  - **Home Accessories** -> `/collections/home-accessories`  
    <sub>page H1: Wholesale Home Accessories UK</sub>
  - **Humidifiers** -> `/collections/humidifiers`  
    <sub>page H1: Wholesale Humidifiers UK</sub>
  - **Storage** -> `/collections/storage`  
    <sub>page H1: Wholesale Storage Products UK</sub>
  - **Lifestyle Products** -> `/collections/lifestyle-products`  
    <sub>page H1: Wholesale Lifestyle Products UK</sub>
- **Kids & School** -> `/collections/kids-school`  
  <sub>page H1: Wholesale Kids & School Supplies UK</sub>
  - **School Bags** -> `/collections/school-bags`  
    <sub>page H1: Wholesale School Bags UK</sub>
  - **School Shoes** -> `/collections/school-shoes`  
    <sub>page H1: Wholesale School Shoes UK</sub>
  - **Kids Accessories** -> `/collections/kids-accessories`  
    <sub>page H1: Wholesale Kids Accessories UK</sub>
  - **Toys & Games** -> `/collections/toys-games`  
    <sub>page H1: Wholesale Toys & Games UK</sub>
  - **Feeding Sets** -> `/collections/feeding-sets`  
    <sub>page H1: Wholesale Feeding Sets UK</sub>
- **Drinkware** -> `/collections/drinkware`  
  <sub>page H1: Wholesale Drinkware UK for Resellers</sub>
  - **Tumblers** -> `/collections/tumblers`  
    <sub>page H1: Wholesale Tumblers UK</sub>
  - **Cups** -> `/collections/cups`  
    <sub>page H1: Wholesale Cups UK</sub>
  - **Bottles** -> `/collections/bottles`  
    <sub>page H1: Wholesale Bottles UK</sub>
  - **Travel Cups** -> `/collections/travel-cups`  
    <sub>page H1: Wholesale Travel Cups UK</sub>
- **Starter Boxes** -> `/collections/starter-boxes`  
  <sub>page H1: Wholesale Starter Boxes UK</sub>
  - **Jewellery Starter Box** -> `/collections/jewellery-starter-box`  
    <sub>page H1: Jewellery Starter Box UK</sub>
  - **Boutique Starter Box** -> `/collections/boutique-starter-box`  
    <sub>page H1: Boutique Starter Box UK</sub>
  - **Mixed Product Starter Box** -> `/collections/mixed-product-starter-box`  
    <sub>page H1: Mixed Product Starter Box UK</sub>
  - **Mixed Branded Jewellery Box** -> `/collections/mixed-branded-jewellery-box`  
    <sub>page H1: Mixed Branded Jewellery Box UK</sub>
- **Dropshipping Available** -> `/collections/dropshipping`  
  <sub>page H1: Dropshipping Products UK, No Minimum Order</sub>

### Also worth adding, as a second menu or lower in the same one

**Shop by need**

- **Under £50** -> `/collections/under-50`  
  <sub>page H1: Wholesale Products Under £50 UK</sub>
- **Under £100** -> `/collections/under-100`  
  <sub>page H1: Wholesale Products Under £100 UK</sub>
- **Low MOQ Wholesale** -> `/collections/low-moq`  
  <sub>page H1: Low MOQ Wholesale UK</sub>
- **Low-Cost Products to Resell** -> `/collections/low-cost-to-resell`  
  <sub>page H1: Low-Cost Wholesale Products to Resell UK</sub>
- **High-Profit-Potential Products** -> `/collections/higher-margin`  
  <sub>page H1: Higher Margin Wholesale Products UK</sub>
- **Best for Vinted** -> `/collections/best-for-vinted`  
  <sub>page H1: Wholesale Products to Sell on Vinted UK</sub>
- **Best for eBay** -> `/collections/best-for-ebay`  
  <sub>page H1: Wholesale Products to Sell on eBay UK</sub>
- **Best for TikTok Shop** -> `/collections/best-for-tiktok-shop`  
  <sub>page H1: Wholesale Products to Sell on TikTok Shop UK</sub>

**What is moving**

- **Trending Now** -> `/collections/trending-now`  
  <sub>page H1: Trending Wholesale Products UK</sub>
- **Back in Stock** -> `/collections/back-in-stock`  
  <sub>page H1: Wholesale Products Back in Stock UK</sub>
- **Selling Fast** -> `/collections/selling-fast`  
  <sub>page H1: Wholesale Products Selling Fast UK</sub>
- **Deal Drops** -> `/collections/deal-drops`  
  <sub>page H1: Wholesale Deal Drops UK</sub>

**Seasonal**

- **Back to School** -> `/collections/back-to-school`  
  <sub>page H1: Wholesale Back to School Products UK</sub>
- **Winter Essentials** -> `/collections/winter-essentials`  
  <sub>page H1: Wholesale Winter Essentials UK</sub>
- **Summer Essentials** -> `/collections/summer-essentials`  
  <sub>page H1: Wholesale Summer Essentials UK</sub>

## A note on empty collections

A collection with no products in it is worse than no collection at all: it
looks broken to a shopper and Google treats it as a thin page. Every one of
these fills itself from a product tag, so a collection stays empty until a
product carries its tag.

If a category is not stocked yet, leave it out of the menu until it is. The
collection still exists and starts working the moment a product is tagged.

## The tags that fill them

| Collection | Fills from |
| --- | --- |
| Jewellery & Accessories | tag `jewellery-accessories` |
| Bags | tag `bags` |
| Clothing | tag `clothing` |
| Beauty & Fragrance | tag `beauty-fragrance` |
| Electronics & Gadgets | tag `electronics` |
| Home & Lifestyle | tag `home-lifestyle` |
| Kids & School | tag `kids-school` |
| Drinkware | tag `drinkware` |
| Starter Boxes | tag `starter-boxes` |
| Necklaces | tag `necklaces` |
| Earrings | tag `earrings` |
| Bracelets | tag `bracelets` |
| Rings | tag `rings` |
| Jewellery Sets | tag `jewellery-sets` |
| Jewellery Starter Box | tag `jewellery-starter-box` |
| Fashion Bags | tag `fashion-bags` |
| Handbags | tag `handbags` |
| School Bags | tag `school-bags` |
| Wallets | tag `wallets` |
| Travel Bags | tag `travel-bags` |
| Women's Clothing | tag `womens-clothing` |
| Casualwear | tag `casualwear` |
| Knitwear | tag `knitwear` |
| Seasonal Clothing | tag `seasonal-clothing` |
| Mixed Clothing Packs | tag `mixed-clothing-packs` |
| Perfumes | tag `perfumes` |
| Mini Perfumes | tag `mini-perfumes` |
| Beauty Accessories | tag `beauty-accessories` |
| Personal Care | tag `personal-care` |
| Fans | tag `fans` |
| Speakers | tag `speakers` |
| Phone Accessories | tag `phone-accessories` |
| Small Electronics | tag `small-electronics` |
| Home Gadgets | tag `home-gadgets` |
| Kitchenware | tag `kitchenware` |
| Home Accessories | tag `home-accessories` |
| Humidifiers | tag `humidifiers` |
| Storage | tag `storage` |
| Lifestyle Products | tag `lifestyle-products` |
| School Shoes | tag `school-shoes` |
| Kids Accessories | tag `kids-accessories` |
| Toys & Games | tag `toys-games` |
| Feeding Sets | tag `feeding-sets` |
| Tumblers | tag `tumblers` |
| Cups | tag `cups` |
| Bottles | tag `bottles` |
| Travel Cups | tag `travel-cups` |
| Boutique Starter Box | tag `boutique-starter-box` |
| Mixed Product Starter Box | tag `mixed-product-starter-box` |
| Mixed Branded Jewellery Box | tag `mixed-branded-jewellery-box` |
| Best Sellers | tag `best-sellers` |
| New Arrivals | tag `new-arrivals` |
| Trending Now | tag `trending-now` |
| Back in Stock | tag `back-in-stock` |
| Selling Fast | tag `selling-fast` |
| Deal Drops | tag `deal-drops` |
| Under £50 | price under £50 (automatic) |
| Under £100 | price under £100 (automatic) |
| Low MOQ Wholesale | tag `low-moq` |
| Low-Cost Products to Resell | tag `low-cost` |
| High-Profit-Potential Products | tag `higher-margin` |
| Best for Vinted | tag `platform-vinted` |
| Best for eBay | tag `platform-ebay` |
| Best for TikTok Shop | tag `platform-tiktok` |
| Dropshipping Available | tag `dropship` |
| Back to School | tag `back-to-school` |
| Winter Essentials | tag `winter-essentials` |
| Summer Essentials | tag `summer-essentials` |
