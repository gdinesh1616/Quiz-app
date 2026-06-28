// varibles declaration
let timeLeft = 30;
let timer;
let totalScore = 0;
let currQuestion = 0;
let numcorrectAns = 0;
let numwrongAns = 0;
let unattemptedQtns = 0;
let totalTime = 0;
let quizId = "";
let data = {};

// to fetch navbar



if (window.location.pathname.endsWith("/")) {
    getQuizzes();
}



// fetching quiz categories and ids
const categorySelect = document.getElementById("category");

async function getQuizzes() {
    try{
        const response = await fetch("https://quizapi.io/api/v1/quizzes", {
        headers: {
            "Authorization": "Bearer qa_sk_d8c731c0097feb3cb298c635dfc4975ef32c253b",
            "Content-Type": "application/json",
        },
        });

        const res = await response.json();
        setCategory(res.data);
    }catch(e){
        alert("Something Went Wrong !!");
    }

}

//setting quiz categories

async function setCategory(data) {
    data.forEach(element => {
        const option  = document.createElement("option");
        option.textContent = element.title;
        option.value = element.id;
        categorySelect.appendChild(option);
    });
}

//storing quiz category

if(categorySelect){
    document.getElementById("category").addEventListener("change",(e)=>{
    quizId = e.target.value;
})
}

//starting the quiz 

const startBtn =  document.getElementById("start-btn");

if(startBtn){
document.getElementById("start-btn").addEventListener("click",()=>{
    startQuiz(quizId);
})
}


async function startQuiz() {
    try{
    const response = await fetch(`https://quizapi.io/api/v1/questions?quiz_id=${quizId}&include_answers=true&type=MULTIPLE_CHOICE`, {
    headers: {
        "Authorization": "Bearer qa_sk_d8c731c0097feb3cb298c635dfc4975ef32c253b",
        "Content-Type": "application/json",
    },
    });
    
    data = await response.json();
    localStorage.setItem("quizData", JSON.stringify(data));
    window.location.href = "./html/question.html";
    }catch(e){
        alert("Something Went Wrong!!");
        return;
    }

}


if (window.location.pathname.endsWith("/question.html")) {
        data = JSON.parse(localStorage.getItem("quizData"));
        data = data.data;
        nextQtn();
        manageQuiz();
}




async function nextQtn() {
    if(currQuestion !== 0){
        const selected = document.querySelector('input[name="answer"]:checked');


        let correctAns = 0;
        for(let i=0;i<data[currQuestion-1].answers.length;i++){
            
            if(data[currQuestion-1].answers[i].isCorrect === true){
                console.log(data[currQuestion-1].answers[i]);
                correctAns = i;
                break;
            }
        }
        if(selected == null){
            unattemptedQtns++;
        }
        else if(selected.value == correctAns){
            numcorrectAns++;
            totalScore = totalScore+3;
        }else{
            numwrongAns++;
        }


  
    }


    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = `${((currQuestion)/data.length)*100}%`;

    const score = document.getElementById("score");
    score.innerHTML = `${totalScore} points`
    const currQtn = document.getElementById("currentQuestion");
    currQtn.innerHTML = `${currQuestion+1} / ${data.length}`
    const progressPercent = document.getElementById("progressPercent");
    progressPercent.innerText  = `${((currQuestion)/data.length)*100}%`;
    const totalQuestions = document.getElementById("totalQuestions");
    totalQuestions.innerText = data.length;
    if(currQuestion === data.length) {
        submitAns();
        return;
    }

    showQuestion();
    startTimer();
}



function showQuestion() {
   const qtnNum =  document.getElementById("qtn-num");
   const qtn = document.getElementById("qtn");
   qtn.textContent = data[currQuestion].text;
   qtnNum.innerText = currQuestion+1;

   const optionsContainer = document.getElementById("options");
   optionsContainer.replaceChildren();

optionsContainer.innerHTML = "";
for(const key in data[currQuestion].answers) {
        optionsContainer.innerHTML += `
            <label class="option-card" for="${key}">
                <input
                    type="radio"
                    id="${key}"
                    name="answer"
                    value="${key}"
                    class="hidden-checkbox">

                <div class="card-content">
                    ${data[currQuestion].answers[key].text}
                </div>
            </label>
        `;

}
}


function startTimer() {

    clearInterval(timer);

    timeLeft = 30;

    document.getElementById("time").textContent = timeLeft;

    timer = setInterval(() => {
        totalTime++;
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
                currQuestion++;
                nextQtn();
        }

    }, 1000);
}


async function manageQuiz() {
    document.getElementById("next-btn").addEventListener("click",()=>{

        if(currQuestion<=data.length){
            currQuestion++;
            nextQtn();


        }else{
            submitAns();
        }
    })

}




async function submitAns() {
    const results = {
       totalCorrectQtns : numcorrectAns,
       totalWrongQtns : numwrongAns,
       totalUnattemptedQtns : unattemptedQtns,
       totalQtns : data.length,
       totalScore: totalScore,
       totalTime : totalTime

    }
    localStorage.setItem("results",JSON.stringify(results));
    window.location.href = "result.html";

}


if (window.location.pathname.endsWith("/result.html")) {
    result();
}

function result() {
   const results = JSON.parse(localStorage.getItem("results"))
   localStorage.clear();
   const h1  =  document.getElementById("final-score");
   const correctQtn = document.getElementById("correct-qtn");
   const wrongQtn = document.getElementById("wrong-qtn")
   const unattemptedQtn = document.getElementById("unattempted-qtn");
   const totalQtn = document.getElementById("total-qtn");
   const percentMarks = document.getElementById("percentage-score");
   const message = document.getElementById("message");
   const totalTime = document.getElementById("total-time")
   const progress = document.getElementById("progress");
   const accuracy = document.getElementById("accuracy");
   const percentageMarks = (results.totalScore/(results.totalQtns * 3))*100;
   const radius = 90;

    const circumference = 2 * Math.PI * radius;
    progress.style.strokeDasharray = circumference;
    const offset = circumference - (percentageMarks / 100) * circumference;
    progress.style.strokeDashoffset = offset;

    h1.innerText = results.totalScore;
    percentMarks.innerText = `${percentageMarks} %`
   correctQtn.innerHTML = `${results.totalCorrectQtns}`
   wrongQtn.innerHTML = ` ${results.totalWrongQtns}`;
   unattemptedQtn.innerHTML = `${results.totalUnattemptedQtns}`;
   totalQtn.innerHTML = `${results.totalQtns}`;
   

   if(percentageMarks === 100){
        message.innerText = "Outstanding Performance";
        message.classList.add("green");
   }else if(percentageMarks >= 60){
    message.innerText = "Great Job !!";
            message.classList.add("green");

   }else if(percentageMarks >= 30){
    message.innerText = "Keep Going "
    message.classList.add("orange");
   }else if(percentageMarks>=0){
    message.innerText = "Needs Improvement";
    message.classList.add("red");
   }

   totalTime.innerText = `${results.totalTime} s`;
   accuracy.innerText = `${((results.totalCorrectQtns/(results.totalCorrectQtns + results.totalWrongQtns))*100).toFixed(1)} %`

}

