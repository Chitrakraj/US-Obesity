##Basic Info
* Project Title: 
    An overview of Factors Effecting US Obesity

* Team

  Tabassum Kakar (email: tkakar@wpi.edu)   (git ID: tkakar)

  Suwodi Dutta Bordoloi (email :sdbordoloi@wpi.edu>)  (git ID : suwDB)
  
  Chitra Pichaimuttu Kanickaraj (email:cpichaimuttukani@wpi.edu)  (git ID:chitrakraj)
  
* Link
[Link to Project]

## Background and Motivation:
Obesity is a major issue, more than 34% of US Adults are obese and it is dangerous as it causes severe diseases such as heart stroke, diabetes and various types of cancer. Through this project we want to highlight the some of the key factors that are known to cause obesity, how obesity has affected the population and details about obesity programs available for the states - which would help the government in planning programs to fight obesity and allocate budgets to these programs

## Project Objectives
The objective of our project is to understand and explore which states are mostly affected by obesity and what are the factors such as socio-economic status, income and physical activity etc  contributing to obesity. We want to explore the factors affecting obesity using visualizations and showing some statistics of the distribution of obesity across different states and people's access to different facilities such as grocery stores etc. The primary objective of the project is to build visualizations that will finally help government to understand the states and demography most prone to obesity, how successful have the past programs been and to help in decision making process for budget allocation.

## Data
Description of the data set (dimensions, names of variables with their description):
The dataset for this study has been chosen from the United States Department of Agriculture (USDA) Economic Research Service portal. This data is collected from a variety of sources and cover varying years and geographic levels. It comprises of about 168 predictors categorized across 9 different categories: 

1. Access and Proximity to Grocery Store: It provides an overview of community's access to grocery store. It includes predictors like Population, low access to store, Low income and low access to store, Households, no car and low access to store, seniors, low access to store and so on.
2.  Store Availability: It provides numbers of supermarkets, grocery stores, supercenters and club stores, and various other establishments that are primarily engaged in retailing a general line of food. It includes predictors like Grocery stores, Grocery stores/1,000 pop, and so on.
3. Restaurant Availability and Expenditures: It provides numbers of limited-service restaurants and full-service restaurants along with their average expenditures on food purchased. It includes predictors like Fast-food restaurants, Fast-food restaurants/1,000 pop, and so on.
4.  Food Assistance: It gives us statistics as to how providing nutrition assistance has helped people make healthy food choices and the effect of economic incentives on making informed decisions about diet quality. Variables such as SNAP participants, WIC participants, Child and Adult Care, etc. give us information about the number of people benefitted by these measures.
5.  Food Insecurity: It provides percentage of prevalence of household-level food insecurity which affects the food intake of household members and disrupted eating patterns   	because of insufficient money and other resources for food. It includes predictors like Household food insecurity (%, three-year average), Household very low food security (change %),  and so on.
6.  Food Prices and Taxes: It provides statistics on price and sales tax of few food items like milk, soda, chips and pretzels to help compare their prices with each other and other general food items. It includes variables such as Price of low-fat milk/national average, Price of sodas/national average, Price of low-fat milk/price of sodas, Soda sales tax, vending, and so on.
7. Local Foods: It provides information on locally sourced and locally available foods and the programs used to enlighten the nutrition education of these farms. It includes variables such as Farmers' markets, Vegetable acres harvested, Orchard farms, Berry acres, and so on.
8. Health and Physical Activity: It provides information on recreation and fitness facilities along with the diabetes and obesity rate among different age groups categorized by income . It includes variables such as High schoolers physically active, Adult diabetes rate, and so on.
9. Socioeconomic Characteristics: It provides a census of population based on race, age group, poverty rate etc. It includes variables such as % White, % Black, % Population 65 years or older, Median household income, Persistent-child-poverty counties and so on.


## Data Processing.
We have data in seperate files for year 2011, 2012 and 2014, so first we need to merge the dataset and deal with the missing values either by removing or by filling them with mean/median. There are some data inconsistencies and some repeated use of same records each year which needs to be removed. 

## Visualization Design
At first we will have an interactive map of US (Fig 1) where we will show how much is obesity widespread in general across all states by color or other parameter. 
![Sketch_map](img/Fig1.jpg.jpeg?raw=true)
By clicking on a state, we can drill down to further details in Fig 2 and Fig 3. 
![Sketch 1](img/image-18-11-15-10-49-1.jpeg?raw=true)
Figure 2 shows the demography by age - seniors, adults and children in that state. By choosing an age group we can see the clustered bar chart (Fig 3), how much are the grocery stores accessible to the specific age group and how much help they get from food assistance program.
Figure - 4, shows the amount of funding in various programs per state.
![Sketch2](img/image-18-11-15-10-49.jpeg?raw=true)
Figure -5 shows a Tree, that can expand on demand i.e. if a user wants see further detail, then the tree will expand.
![Sketch3](img/image-18-11-15-10-49-2.jpeg?raw=true)

## Must-Have Features. List the features without which you would consider your project to be a failure.
There should be a map showing different states of US as a starting point of the visualization and then drilling down further to explore the data based on different variables such as Counties inside the states, socio-economic status etc 

## Optional Features
Drilling down by other fields such as prices & taxes etc.

## Project Schedule
Nov 18 - Nov 24:	Data processing (cleaning and consolidation) 

Nov 24 - Dec 1:	Work on visualizations	

Dec 1 - Dec 8:		Work on visualizations (ctnd.)

Dec 8 - Dec 15:	Prepare process book, project website, project screen-cast.




