# Order confirmation email

Where: **Shopify admin > Settings > Notifications > Order confirmation > Edit code**

Shopify's default email is a receipt and nothing else. This version keeps the
receipt intact and adds three things it is missing: the delivery promise in
plain words, the Wholesale Hub invite that a first order earns, and the Skool
invite when the order is an Academy place.

Everything below is conditional. A customer only ever sees the blocks that
apply to their order, so nobody buying a pack of earrings is told about Skool.

---

## 1. Delivery, in words rather than a table

Paste directly **above** the existing `{% if requires_shipping %}` block.

```liquid
<table class="row section">
  <tr>
    <td class="section__cell">
      <h3>When it arrives</h3>
      <p>
        Everything ships from our UK warehouse. Standard delivery is
        <strong>3 working days</strong> from dispatch.
      </p>
      <p>
        You will get a second email with your tracking link the moment it
        leaves us. If it has not arrived by day five, reply to this email and
        we will chase it, not you.
      </p>
    </td>
  </tr>
</table>
```

---

## 2. The Wholesale Hub invite, on a first order only

Paste **after** the order summary. The condition matters: a returning customer
is already in the group, and being invited again reads as careless.

```liquid
{% if customer.orders_count == 1 %}
<table class="row section">
  <tr>
    <td class="section__cell" style="background:#001A3F;color:#ffffff;padding:24px;border-radius:8px;">
      <h3 style="color:#FFB303;margin:0 0 8px;">You're in.</h3>
      <p style="color:#ffffff;margin:0 0 16px;">
        That first order unlocks the GBG Wholesale Hub: the buyers-only group
        where restocks are announced before they reach the shop, and where the
        people who are actually shifting stock answer questions.
      </p>
      <a href="REPLACE_WITH_WHOLESALE_HUB_LINK"
         style="display:inline-block;background:#FFB303;color:#001A3F;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
        Join the Wholesale Hub
      </a>
    </td>
  </tr>
</table>
{% endif %}
```

Replace `REPLACE_WITH_WHOLESALE_HUB_LINK` with the WhatsApp invite. It is the
same link stored in **Theme settings > Community links**, but Shopify emails
cannot read theme settings, so it has to be pasted here as well. If the group
link ever changes, change it in both places.

---

## 3. The Skool invite, for Academy orders only

Paste after the block above. It checks the line items for the Academy product,
so it fires on an Academy purchase and stays silent on everything else.

```liquid
{% assign is_academy = false %}
{% for line in line_items %}
  {% if line.product.handle == 'gbg-academy' %}
    {% assign is_academy = true %}
  {% endif %}
{% endfor %}

{% if is_academy %}
<table class="row section">
  <tr>
    <td class="section__cell" style="background:#FFEBBC;padding:24px;border-radius:8px;">
      <h3 style="margin:0 0 8px;">Welcome to the Academy</h3>
      <p style="margin:0 0 16px;">
        All six modules are waiting for you inside, and so is Lami. Post your
        listings and your numbers in the group and you will get them back
        marked up.
      </p>
      <a href="REPLACE_WITH_SKOOL_LINK"
         style="display:inline-block;background:#001A3F;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
        Open the Academy community
      </a>
      <p style="margin:16px 0 0;font-size:13px;">
        Use the same email address you checked out with, so we can match you up.
      </p>
    </td>
  </tr>
</table>
{% endif %}
```

---

## 4. A human sign-off

Replace Shopify's default closing line at the bottom of the template.

```liquid
<table class="row footer">
  <tr>
    <td class="footer__cell">
      <p>
        Thanks for ordering. If anything about this is not right, reply to this
        email and it comes straight to me.
      </p>
      <p><strong>Lami</strong><br>GBG Wholesale Hub</p>
    </td>
  </tr>
</table>
```

---

## Before you switch it on

1. Paste each block, then use **Preview** at the top of the editor.
2. Preview only ever shows a sample order, so the conditional blocks will not
   all appear. To test them properly, place a real order for a cheap product,
   then a second one, and check that the Hub invite appears on the first and
   not the second.
3. Send yourself a test with **Send test email**.
4. Both `REPLACE_WITH_` placeholders must be filled in before this goes live.
   An email that promises an invite and then does not carry one is worse than
   no email.

## What is not possible here

Shopify notification emails cannot read theme settings, so the two links are
pasted rather than pulled from one place. They are the only duplicated values
in the whole build; everything else on the site reads from Theme settings.
