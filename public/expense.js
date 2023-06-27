const token = localStorage.getItem('token')
console.log(token);
function addExpense(e) {
  e.preventDefault();

  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('User is not authenticated');
    return;
  }

  const config = {
    headers: {
      'Authorization': token
    }
  };

  const expenseDetails = {
    amount: amount,
    description: description,
    category: category
  };

  axios.post('http://localhost:3000/expenses/addexpense', expenseDetails, config)
  .then(response => {
    if(response.status === 201) {
      addNewExpense(response.data.expense)
    }
  })
  .catch(err => console.log(err));
  
}

const addExpenseButton = document.getElementById('submit');
addExpenseButton.addEventListener('click', addExpense);

function deleteExpense(event) {
  const token = localStorage.getItem('token');
  const expenseId = event.target.dataset.expenseid;
  console.log(expenseId)
  axios.delete(`http://localhost:3000/expenses/delete/${expenseId}`, {
    headers: {
      "Authorization": token
    }
  })
  .then(() =>{
    removeExpense(expenseId)
  })
  .catch(err => {
    console.log(err);
  })
}

function removeExpense(expenseid) {
  const expenseId = `expense-${expenseid}`;
  document.getElementById(expenseId).remove();
}

function showPremium() {
  const button = document.getElementById('razor-pay-btn');
  const premiumText = document.getElementById('premium-text');
  const token = localStorage.getItem('token');
  const decodeToken = parseJwt(token);
  const isPremium = decodeToken.isPremium;
console.log(isPremium)
  if (isPremium) {
    button.style.display = 'none';
    premiumText.style.display = 'block';
  } else {
    button.style.display = 'block';
    premiumText.style.display = 'none';
  }
}

document.getElementById('razor-pay-btn').onclick = async function (e) {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://localhost:3000/purchase/premiumuser', {
      headers: { "Authorization": token }
    });
    console.log(response);
    const options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        try {
          const paymentResponse = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id
          }, {
            headers: { "Authorization": token }
          });
          const updatedToken = paymentResponse.data.token;
          console.log(updatedToken);
          localStorage.setItem('token', updatedToken);
          alert('You are a Premium User now');
          const button = document.getElementById('razor-pay-btn');
          button.style.display = 'none';
          document.getElementById('premium-text').style.display = 'block';
          showLeaderBoard();
        } catch (error) {
          console.error(error);
          alert('Something went wrong while updating transaction status');
        }
      }
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();
    rzp1.on('payment.failed', function (response) {
      console.log(response);
      alert('Payment failed');
    });
  } catch (error) {
    console.error(error);
    alert('Something went wrong while fetching Razorpay details');
  }
};


function addNewExpense(expense) {
  console.log(expense);
  const pElement = document.getElementById('expense-list');
  const expenseId = `expense-${expense._id.toString()}`; // Convert _id to string
  pElement.innerHTML += `
    <li id=${expenseId}>
      ${expense.amount} - ${expense.description} - ${expense.category}
      <button class="delete-btn" data-expenseid="${expense._id.toString()}">Delete Expense</button>
    </li>`;

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', deleteExpense);
  });
}

function addNewLeader(leader) {
  const pElement = document.getElementById('leaderboard');
  pElement.innerHTML += `
  <li>
    ${leader.name} - ${leader.amount}
    </li>`
}

function showLeaderBoard() {
  const leaderboardBtn = document.getElementById('leaderboard-btn');
  leaderboardBtn.style.display = 'block';
  leaderboardBtn.addEventListener('click', async () => {
    try {
      const response = await axios.get('http://localhost:3000/purchase/leaderboard', {headers: {"Authorization": token}}); 
      console.log(response.data);

      // Create an unordered list element to display the data
      const leaderboardList = document.createElement('ul');

      // Loop through the response data and create a list item for each object
      response.data.forEach(obj => {
        const listItem = document.createElement('li');
        listItem.textContent = `${obj.name}: $${obj.totalExpense}`;
        leaderboardList.appendChild(listItem);
      });

      // Display the list in the leaderboard container
      const leaderboardContainer = document.getElementById('leaderboard-container');
      leaderboardContainer.innerHTML = '';
      leaderboardContainer.appendChild(leaderboardList);
      leaderboardContainer.style.display = 'block';

      // const refreshBtn = document.createElement('button');
      // refreshBtn.innerText = 'Refresh';
      // refreshBtn.addEventListener('click', showLeaderBoard);
      // leaderboardContainer.parentNode.insertBefore(refreshBtn, leaderboardContainer.nextSibling);
      
    } catch(err) {
      throw new Error(err);
    }
  });
}

function parseJwt (token) {
 
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token')
  const decodeToken = parseJwt(token)
  const isPremium = decodeToken.isPremium;
  console.log(isPremium)
  if(isPremium) {
    showPremium();
    showLeaderBoard();
  }
  axios.get('http://localhost:3000/expenses/getexpenses', { headers: {"Authorization": token}})
  .then(response => {
    console.log(response)
    const expenses = Array.isArray(response.data.expenses) ? response.data.expenses : Object.values(response.data.expenses);
      expenses.forEach(expense => {
      addNewExpense(expense);
    })
  })
})

