document.addEventListener("DOMContentLoaded", function () {
  const cartTableBody = document.querySelector("#cart-items");
  const totalElement = document.getElementById("cart-total");
  const checkoutButton = document.getElementById("checkout-btn");
  const form = document.getElementById("delivery-form");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let totalAmount = 0;

  cart.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>RM ${parseFloat(item.price).toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>RM ${(item.price * item.quantity).toFixed(2)}</td>
    `;
    cartTableBody.appendChild(row);
    totalAmount += item.price * item.quantity;
  });

  totalElement.textContent = `RM ${totalAmount.toFixed(2)}`;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("full-name").value;
    const phone = document.getElementById("phone-number").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("full-address").value;

    if (!name || !phone || !email || !address) {
      alert("Sila isi semua maklumat penghantaran.");
      return;
    }

    if (cart.length === 0) {
      alert("Troli anda kosong.");
      return;
    }

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Memproses...";

    const customerData = {
      name,
      phone,
      email,
      address
    };

    const payload = {
      name: customerData.name,
      email: customerData.email,
      mobile: customerData.phone,
      address: customerData.address,
      items: cart,
      total: totalAmount
    };

    try {
      const response = await fetch("/api/create-bill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const toyyibpayResult = await response.json();

      if (toyyibpayResult[0] && toyyibpayResult[0].BillCode) {
        // ✅ Redirect to ToyyibPay payment page
        window.location.href = `https://toyyibpay.com/${toyyibpayResult[0].BillCode}`;
      } else {
        throw new Error("Tiada BillCode dikembalikan.");
      }
    } catch (error) {
      console.error("Ralat semasa proses checkout:", error);
      alert("Ralat ToyyibPay: Gagal mencipta bil pembayaran.");
    } finally {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Teruskan ke Bayaran";
    }
  });
});
