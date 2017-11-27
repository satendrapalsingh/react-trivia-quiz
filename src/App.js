import React, { Component } from 'react';
import logo from './quiz.jpg';
import './App.css';


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      detailsSubmitted: false,
      appStatus: "start",
      username: null,
      useremail: null,
      userphone: null,
      quiz: {
        categories: {
          "Any Category": 0,
          "General Knowledge": 9,
          "Entertainment: Books": 10,
          "Entertainment: Film": 11,
          "Entertainment: Music": 12,
          "Entertainment: Musicals & Theatres": 13,
          "Entertainment: Television": 14,
          "Entertainment: Video Games": 15,
          "Entertainment: Board Games": 16,
          "Science & Nature": 17,
          "Science: Computers": 18,
          "Science: Mathematics": 19,
          "Mythology": 20,
          "Sports": 21,
          "Geography": 22,
          "History": 23,
          "Politics": 24,
          "Art": 25,
          "Celebrities": 26,
          "Animals": 27,
          "Vehicles": 28,
          "Entertainment: Comics": 29,
          "Science: Gadgets": 30,
          "Entertainment: Japanese Anime & Manga": 31,
          "Entertainment: Cartoon & Animations": 32
          },
        difficulties: ["any difficulty", "easy", "medium", "hard"], 
      },
      categorySelected: null,
      difficultySelected: null,   
      answersRight: 0,
    };
  }

 handleUserDetails = (event) => {
   if(event.target.name === "name"){
     this.setState({username: event.target.value});
   }   
   if(event.target.name === "email"){
     this.setState({useremail: event.target.value});
   }   
   if(event.target.name === "phone"){
     this.setState({userphone: event.target.value});
   }
  }

 handleCategorySelected = (event) => {
  this.setState({categorySelected: [event.target.value]});
  }

 handleDifficultySelected = (event) => {
  this.setState({difficultySelected: event.target.value});
  }
  
  keepScore = () => {
    this.setState({answersRight: this.state.answersRight + 1});
  }

  startQuiz = () => {
    this.setState({appStatus: "quiz"});
  }
  
  restartApp = () => {
    this.setState({appStatus: "start"});
  }

  endQuiz = () => {
    this.setState({appStatus: "result"});      
  }
  
  render() {
    
    switch (this.state.appStatus) {
      case 'start':
        return (
          <div className="CenterScreen">
            <Welcome />
            <input placeholder="name" type="text" name="name" 
              onChange={this.handleUserDetails}
              />
            <br/>
            <input placeholder="email" type="text" name="email" 
              onChange={this.handleUserDetails}
              />
            <br/>
            <input placeholder="phone" type="text" name="phone" 
              onChange={this.handleUserDetails}
              />
            <br/>
            <br/>
            <select id="category" onChange={this.handleCategorySelected}>
                <option value="" disabled selected>select category</option>
                {Object.keys(this.state.quiz.categories).map((keyName, keyIdx) => (
                  <option key={keyName} value={this.state.quiz.categories[keyName]}>{keyName}</option>
                ))}
            </select>  
            <select id="difficulty" onChange={this.handleDifficultySelected}>
                <option value="" disabled selected>select difficulty</option>
                {this.state.quiz.difficulties.map((el, idx) => (
                  <option key={idx} value={el}>{el}</option>
                ))}
            </select>
            <br/>
            <button className="UIblocks" onClick={this.startQuiz}>Start Quiz</button>
          </div>
        );
        break;
        
      case 'quiz':
        return (
          <div>
          <Quiz 
            {...this.state}   onRestart={this.restartApp}  onEndQuiz={this.endQuiz}   onAnswerRight={this.keepScore} 
          />
          </div>
        );
        break;
        
      case 'result':
        return (
          <Result 
            {...this.state}
          />
        );
        break;
      default:
      //do nothing
    }
  }
}

function Welcome(){
  return(
    <div>
      <header>
        <img src={logo} className="StartLogo" alt="logo" />
      </header>
      <h1>Welcome to the Trivia Quiz!</h1>
      <p>Please enter your details, select your options and press the Start Quiz button to begin the quiz.</p>
      <p><small>You have <strong>60</strong> seconds to answer <strong>20</strong> questions.</small></p>       
    </div>
  )
}


class Quiz extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedOption: null,
      apiResponseCode: 0,
      questionSet: [],
      questionNbr: 0,
      answerCorrect: [],
      answersIncorrect: [],
      answersAllRandom: [],
      secondsLeft: 60,
    };
  }
  
  tickSeconds = () => {
    this.setState({secondsLeft: this.state.secondsLeft - 1});
    if (this.state.secondsLeft === 0){
      this.handleEndQuiz();
    }
  }
  
  handleSelection = (event) => {
    if(event.target.value === this.state.answerCorrect[this.state.questionNbr]){
      this.props.onAnswerRight();
    }
    this.setState({
      selectedOption: event.target.name,
      questionNbr: this.state.questionNbr + 1
    });
    if (this.state.questionNbr === 19){
      this.handleEndQuiz();
    }
  }
  
  handleRestart = () => {
    this.props.onRestart();
  }
  
  handleEndQuiz = () => {
    this.props.onEndQuiz();
  }
  
  componentDidMount(){
    //build API url
    const url = "https://opentdb.com/api.php?amount=20"
              + "&category=" 
              + this.props.categorySelected 
              + "&difficulty=" 
              + (this.props.difficultySelected!=="any difficulty"? this.props.difficultySelected : "")
              + "&type=multiple";
              
    //fetch api data
    console.log("buildurl: " + url);
    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      this.setState({apiResponseCode: data.response_code});
      
      function randomizeArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }
      
      var questionSet = this.state.questionSet.slice();
      var answerCorrect = this.state.answerCorrect.slice();
      var answersIncorrect = this.state.answersIncorrect.slice();
      var answersAllRandom = this.state.answersAllRandom.slice();
      
      for(var l = 0; l < 20; l++){
        answersAllRandom[l] = [0, 0, 0, 0];
      }
      
      for(var i = 0; i < 20; i++){
        questionSet.push(data.results[i].question);
        answerCorrect.push(data.results[i].correct_answer);
        answersIncorrect.push(data.results[i].incorrect_answers);
        var arrPlaceholder = []; 
        arrPlaceholder[0] = answerCorrect[i];
        arrPlaceholder[1] = answersIncorrect[i]["0"];
        arrPlaceholder[2] = answersIncorrect[i]["1"];
        arrPlaceholder[3] = answersIncorrect[i]["2"];
        randomizeArray(arrPlaceholder);
        answersAllRandom[i][0] = arrPlaceholder[0];    
        answersAllRandom[i][1] = arrPlaceholder[1];    
        answersAllRandom[i][2] = arrPlaceholder[2];    
        answersAllRandom[i][3] = arrPlaceholder[3];  
      }      
      this.setState({questionSet: questionSet});
      this.setState({answerCorrect: answerCorrect});
      this.setState({answersIncorrect: answersIncorrect});
      this.setState({answersAllRandom: answersAllRandom});

    })
    .catch(function(error){
      if(error){
        console.log("error while fetching API data: " + error);
      }
    });
    
    //start the timer
    this.interval = setInterval(this.tickSeconds, 1000);
  }
  
  componentWillUnmount(){
    //clear the timer
    clearInterval(this.interval);    
  }

  render(){
 var strarray = String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[0];
 console.log("this : " + strarray);
  
    if(this.state.apiResponseCode !== 0){
      return(
         <div className="CenterScreen">
            <h3>Sorry, chosen combination of quiz category and difficulty level doesn't exist.</h3>
            <button onClick={this.handleRestart}>Try Again</button>
         </div>
        )
    }    
    else {
      return(
        <div className="CenterScreen">
          <h4><small>{this.props.username}, you have </small>{this.state.secondsLeft}<small> seconds left!</small></h4>  
          <h3>Question No.{this.state.questionNbr + 1}</h3>
          <p>{this.state.questionSet[this.state.questionNbr]}</p>
         <form>
            <div>
              <label>
                <input type="radio" name="option1" 
                  value={String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[0]} 
                  checked={this.state.selectedOption === 'option1'}
                  onChange={this.handleSelection}
                />
                {String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[0]}
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="option2"
                  value={String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[1]}                 
                  checked={this.state.selectedOption === 'option2'}
                  onChange={this.handleSelection}  
                />
                {String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[1]}
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="option3"
                  value={String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[2]}                 
                  checked={this.state.selectedOption === 'option3'}
                  onChange={this.handleSelection}    
                />
                {String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[2]}
              </label>
            </div>          
            <div>
              <label>
                <input type="radio" name="option4"
                  value={String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[3]}                 
                  checked={this.state.selectedOption === 'option4'}
                  onChange={this.handleSelection}    
                />
                {String(this.state.answersAllRandom[this.state.questionNbr]).split(",")[3]}
              </label>
            </div>
          </form>
        <p><strong>{this.props.username}</strong>, you got <strong>{this.props.answersRight}/ 20 </strong> answers right.</p>            
        </div>
      );}
  }
}

class Result extends Component {
  constructor(props){
    super(props);
  }
  render(){  
    return(
      <div className="CenterScreen">
        <h1>Time Up!</h1>
        <p><strong>{this.props.username}</strong>, you got <strong>{this.props.answersRight}/ 20 </strong> answers right.</p>      
      </div>
    );
  }
}

export default App;
