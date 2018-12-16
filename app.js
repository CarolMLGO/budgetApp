//IIFF data privacy
//Buget controller module
const budgetController = (
	() => {
		let Expense = function (id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
			this.percentage = -1;
		}; // function constructor

		Expense.prototype.calcPercentage = function (totalIncome) {
			if(totalIncome > 0) {
				this.percentage = Math.round(this.value/totalIncome*100);
			} else {
				this.percentage = -1;
			}
		}; // Expense prototype

		Expense.prototype.getPercentage = function () {
			return this.percentage;
		}

		let Income = function (id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}; // function constructor

		let calculateTotal = function (type) {
			let sum = data.allItems[type].reduce((acc,cur)=>{
				return cur.value + acc;
			},0);
			data.totals[type] = sum;
		};

		// let calculatePercentage = () => {
		// 	data.percentages = data.allItems["expense"].map((cur)=>{
		// 		return Math.round(cur.value/data.totals["income"]*100);
		// 	})
		// };

		let data = {
			allItems: {
				expense:[],
				income: []	//expense and income using array structure, becomes order matters;
			},
			totals: {
				expense: 0,
				income: 0
			},
			// percentages:[],
			budget: 0,
			percentage: -1
		}; // put everthing inside on big data structure.

		return {
			addItem: (type, des, val) => {
				let newItem;

				//create new ID
				if(data.allItems[type].length>0) {
					ID = data.allItems[type][data.allItems[type].length-1].id + 1;
				} else {
					ID = 0;
				}

				//create new item based on "inc" or "exp" type
				if (type ==="expense") {
					newItem = new Expense(ID, des,val);
				} else if (type ==="income") {
					newItem = new Income (ID, des, val);
				}

				//push it into our data strucuture
				data.allItems[type].push(newItem);

				//Return the new element
				return newItem;
			},

			calculateBudget: () => {
				//calculate total income and expenses
				calculateTotal("income");
				calculateTotal("expense");

				//calculate the budget: income - expenses
				data.budget = data.totals.income - data.totals.expense;

				//calculate the percentage of income that we spent
				if (data.totals.income > 0) {
					data.percentage = ((data.totals.expense/data.totals.income)*100).toFixed(0);
				} else {
					data.percentage = -1; // non-existance, will be used later
				}
				// or data.percentage = Math.round((data.totals.expense/data.totals.income)*100);
			},

			//a simple purpose: retrieve budget data
			getBudget: () => {
				return {
					budget: data.budget,
					totalIncome: data.totals.income,
					totalExpense: data.totals.expense,
					percentage: data.percentage
				}
			},

			calculatePercentages: () => {
				data.allItems["expense"].forEach(cur => {
					cur.calcPercentage(data.totals.income);
				})
				
			},

			getPercentages: () => {
				let allPerc = data.allItems["expense"].map((cur)=>{
					return cur.getPercentage()
				})
				return allPerc;
			},

			deleteItem: (type,id) => {
				//find the index number ---id to delete
				let ids = data.allItems[type].map((cur)=>{
					return cur.id;
				})
				let index = ids.indexOf(id); //if item does not exist
				if (index !== -1 ) {
					data.allItems[type].splice(index,1);
				}
				
			},

			testing: () => {
				console.log(data)
			}
		}

})();


//UI controller module
const UIController = (
	() => {
		let DOMstrings = {
			inputType: ".add__type",
			inputDescription: ".add__description",
			inputValue: ".add__value",
			addButton: ".add__btn",
			incomeContainer: ".income__list",
			expensesContainer: ".expenses__list",
			budgetLabel: ".budget__value",
			incomeLabel: ".budget__income--value",
			expenseLabel: ".budget__expenses--value",
			percentageLabel: ".budget__expenses--percentage",
			container: ".container",
			percentageItem:".item__percentage",
			dateLabel: ".budget__title--month"
		}; //put all the class name here, they can be modified easily

		const formatNumber = (num,type) => {
			let numSplit, int, dec;
			// 1. + or - before the number 
			//2. exactly 2 decimal points 
			// 3. comma seperating the thousands

			num = Math.abs(num);
			num = num.toFixed(2); // output a string with 2 decimal
			numSplit = num.split(".");
			int = numSplit[0]; // integer part
			dec = numSplit[1]; //decimal part

			if (int.length > 3) {
				int = int.substring(0,int.length - 3) + "," + int.substring(int.length - 3, int.length); //input 2310, output 2,310
			}

			return (type === "expense" ? "-" : "+") + " " + int + "." + dec;
		};

		return {
			getinput: () => {
				return {
					type: document.querySelector(DOMstrings.inputType).value, // will be either income or expense
					description: document.querySelector(DOMstrings.inputDescription).value,
					value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
				}//it is simple to return an object containing all the property we want to get
			},
			addListItem: (obj,type) => {
				let html, newHTML, element;
				// create HTML string with placeholder text

				if (type === "income") {
					element = DOMstrings.incomeContainer;
					html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				} else if(type === "expense") {
					element = DOMstrings.expensesContainer;
					html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				}
				// replace the placeholder text with some actual data
				newHTML = html.replace("%id%",obj.id);
				newHTML = newHTML.replace("%description%",obj.description);
				newHTML = newHTML.replace("%value%",formatNumber(obj.value,type));

				// insert the HTML into the DOM
				document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
			},
				//clear fields
			clearFields: () => {
				let fields,fieldArr;

				fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);
				//convert a list to an array, for older browser, for each might not be able to be used for list. useful to know how to convert a list to an array.
				fieldArr = Array.prototype.slice.call(fields);
				fieldArr.forEach(current=> current.value="");

				//move the focus to the first item
				fieldArr[0].focus();
			},

			displayBudget: (obj) => {
				let type;
				obj.budget > 0 ? type = "income" : type = "expense";

				document.querySelector(DOMstrings.budgetLabel).textContent =  formatNumber(obj.budget,type);

				document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,"income");

				document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense,"expense");

				if (obj.percentage > 0) {
					document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%"
				} else {
					document.querySelector(DOMstrings.percentageLabel).textContent = "---"
				};

			},

			displayPercentages: (percentages) => {
				let percentEl = document.querySelectorAll(DOMstrings.percentageItem);
				if(percentEl !== null) {
					percentEl.forEach((cur,index)=>{
						if(percentages[index]!=-1) {
							cur.textContent =  percentages[index] + "%";
						} else {
							cur.textContent = "---";
						}
					})
				}
			},

			//how to remove an element from DOM
			deleteListItem: (selectorID) => {
				document.getElementById(selectorID).remove();
			},
			//another way: DOM api approach
			// deleteListItem: function(selectorID) {
			// 	var el = document.getElementById(selectorID);
			// 	el.parentNode.removeChild(el);
			// },

			displayMonth: () => {
				let now,year,month;
				now = new Date();
				months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
				year =  now.getFullYear();
				month = now.getMonth();
				document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;

			},

			changedType: () => {
				let fields;
				fields = document.querySelectorAll(DOMstrings.inputType + ","+ DOMstrings.inputDescription + "," + DOMstrings.inputValue);
				document.querySelector(DOMstrings.addButton).classList.toggle("red");
				fields.forEach(cur=>{
					cur.classList.toggle("red-focus");
				})

			},

			getDOMstrings: () => {
				return DOMstrings;
			}//make the DOM string public
		}
	}
)();


//global app controller module, make UI and budget modules to communicata with each other
const controller = (
	(budgetCtrl,UICtrl) => {
		// setupEventListeners for all the events listeners
		const setupEventListeners = () => {
			let DOM = UICtrl.getDOMstrings();
			document.querySelector(DOM.addButton).addEventListener("click",ctrlAddItem);
			document.addEventListener("keypress",(ev)=>{
				if(ev.keycode === 13 || ev.which === 13) {
					ctrlAddItem();
				}//older browser uses which property.
			});

			document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);
			document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType);
		}

		const updateBudget = () => {
			//1. calculate the budget
			budgetCtrl.calculateBudget();

			//2. return the budget
			let budget = budgetCtrl.getBudget();
			// console.log(budget);

			//3. display the budget on the UI
			UICtrl.displayBudget(budget);
		};

		const updatePercentages = () => {
			//1. calculate percentages
			budgetCtrl.calculatePercentages();

			//2. Return percentages
			let percentages = budgetCtrl.getPercentages();

			//3. display percentages on the UI
			UICtrl.displayPercentages(percentages);
		}

		const ctrlAddItem = () => {
			let input,newItem;
			//1. get the input value
			input = UICtrl.getinput();

			//prevent false inputs
			if (input.description !== "" && ! isNaN(input.value) && input.value > 0) {
			//2. add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. add the item to the UI
			UICtrl.addListItem(newItem,input.type)

			//4. clear the fields
			UICtrl.clearFields();

			//5. calculate and update budget
			updateBudget();

			//6. calculate and update percentages
			updatePercentages();
			};
		};

		const ctrlDeleteItem = (event) => {
			let itemID, splitID;
			itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
			if(itemID) {
				splitID = itemID.split("-");
				type = splitID[0];
				id = parseInt(splitID[1]); //convert string into number
			}

			//1. delete the item from the data strucutre
			budgetCtrl.deleteItem(type,id);

			//2. delete the item from the UI
			UICtrl.deleteListItem(itemID);

			//3. update and show the new budget
			updateBudget();

			//4. update and show the percentages
			updatePercentages();

		};

		return {
			init: () => {
				console.log('application has started.')
				setupEventListeners();
				UICtrl.displayBudget(
					{budget: 0,
					totalIncome: 0,
					totalExpense: 0,
					percentage: 0});
				UICtrl.displayMonth();
			}
		};

})(budgetController,UIController);

controller.init();