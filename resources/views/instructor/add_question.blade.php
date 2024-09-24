@vite('resources/css/app.css')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
    crossorigin="anonymous" referrerpolicy="no-referrer" />

<div class="grid grid-cols-6 h-screen">

    <x-sidebar>
        <a href="#" class="text-start bg-secondary-color text-black rounded-l-3xl w-full p-3 ">Course</a>
        <a href="#" class="p-3">Questions</a>
        <a href="#" class="p-3">Candidates</a>
    </x-sidebar>
    <div id="" class="flex gap-5 capitalize col-start-2 col-end-7 p-5">
        <div class='w-full '>
            <h1 class="text-end">course - name</h1>
            <div id="questionsWrapper">
                <div class='bg-white/70 p-5'>
                    <p class="my-2">Discuss the role of nonverbal communication in public speaking. How can a speaker
                        effectively use
                        body language, facial expressions, and eye contact to enhance their message</p>

                    <div class="flex justify-end gap-5">
                        <button id="view-question">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="edit-question">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="question-model" class="hidden absolute bg-secondary-color/50 h-screen w-full top-0">
            <div class="absolute top-[50%] left-[50%] -translate-x-[70%] -translate-y-[50%] bg-white p-8">
                <div class="flex justify-end">
                    <button id="close-model">
                        <i class="fas fa-circle-xmark"></i>
                    </button>
                </div>
                <div>
                    <h1 class="font-bold my-2">Question</h1>
                    <p>Discuss the role of nonverbal communication in public speaking. How can a speaker effectively use
                        body language, facial expressions, and eye contact to enhance their message</p>
                </div>
                <div>

                    <h1 class="font-bold my-2">Answer</h1>

                    <p>Discuss the role of nonverbal communication in public speaking. How can a speaker effectively use
                        body language, facial expressions, and eye contact to enhance their message</p>
                </div>
                <div class="my-4">
                    <h1 class="font-bold my-2">Options</h1>
                    <div class="border-2 border-black">
                        <div>
                            <p class="my-2 p-2">1) <span>Nonverbal communication has no impact on public speaking; only
                                    the spoken words
                                    matter.</span></p>
                            <p class="my-2 p-2">2) <span>Nonverbal communication has no impact on public speaking; only
                                    the spoken words
                                    matter.</span></p>
                            <p class="my-2 p-2">3) <span>Nonverbal communication has no impact on public speaking; only
                                    the spoken words
                                    matter.</span></p>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button><i class="fas fa-pen-to-square"></i></button>
                </div>
            </div>

        </div>

        <div class="flex-1 w-full bg-white/70 p-4">
            <form action="#">
                <h3>Add Question</h3>
                <div class="mb-3">
                    <label for="question" class="my-4 block">question</label>
                    <textarea id="question" name="question" placeholder="Write Question Here ..." id="" cols="30"
                        rows="10" class="bg-secondary-color rounded-lg p-2 "></textarea>
                </div>
                <div class="mb-3">
                    <label for="correctAnswer" class="my-4 block">Correct Answer</label>
                    <textarea id="answer" name="correctAnswer" placeholder="Write Correct Answer Here ..." id="" cols="30"
                        rows="10" class="bg-secondary-color rounded-lg p-2 "></textarea>
                </div>
                <div class="mb-3">
                    <label for="option" class="my-4 block">Options</label>
                    <textarea id="option" name="option" placeholder="Write option Here ..." id="" cols="30" rows="10"
                        class="bg-secondary-color rounded-lg p-2 "></textarea>
                    <div class="flex justify-end my-4">
                        {{-- <x-form_button text='add option' type='button' onClick="hello()" /> --}}
                        <button type="button" id="add-optionBtn"
                            class="px-5 py-2 bg-black text-secondary-color capitalize">add option</button>
                    </div>
                </div>
                <div>
                    <div>
                        <div id="option-wrapper" class="my-4 hidden">
                            <h1 class="font-bold my-2">Options</h1>
                            <div class="border-2 border-black">
                                <div id="option-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <button id="submit" type="submit" class="bg-black p-3 w-full text-white capitalize">add
                        question</button>
                </div>
            </form>
        </div>
        <div>
        </div>
    </div>
</div>


<script>
    const viewQuestionBtn = document.querySelector('#view-question')
    const closeModel = document.querySelector('#close-model')
    const optionWrapper = document.querySelector('#option-wrapper')
    const form = document.forms[0]

    const options = []
    options.length >= 0 ? optionWrapper.classList.add('hidden') : optionWrapper.classList.remove('hidden')

    form.addEventListener('click', (e) => {
        e.preventDefault()
        const option = document.querySelector('#option')
        const optionContainer = document.querySelector('#option-container')
        const questionsWrapper = document.querySelector('#questionsWrapper')

        const question = document.querySelector('#question')
        const answer = document.querySelector('#answer')


        const div = document.createElement('div')
        const p = document.createElement('p')
        const span = document.createElement('span')

        const questionContainer = document.createElement('div')
        const questionP = document.createElement('p')


        const optionsDiv = document.createElement('div')
        const viewBtn = document.createElement('button')
        const editBtn = document.createElement('button')
        const viewIcon = document.createElement('i')
        const editIcon = document.createElement('i')

        if (e.target.id == 'add-optionBtn') {
            if (option.value !== '') {
                optionWrapper.classList.remove('hidden')
                options.push(option.value)
                option.value = ' '
                options.forEach((option, index) => {
                    p.textContent = `${index+1}) ${option}`
                    p.classList.add('my-2', 'p-2')
                    p.appendChild(span)
                    optionContainer.appendChild(p)
                });
            }
        }
        if (e.target.id == 'submit') {
            if (!question.value || !answer.value || options.length <= 0) {
                console.log('empty inputs')
                return
            } else {
                questionContainer.classList.add('bg-white/70', 'p-5', 'my-5')
                questionP.classList.add('my-2')
                questionP.textContent = question.value
                questionContainer.appendChild(questionP)

                optionsDiv.classList.add('flex', 'justify-end', 'gap-5')
                viewBtn.setAttribute('id', 'view-question') 
                viewIcon.classList.add('fas', 'fa-eye')
                viewBtn.appendChild(viewIcon)


                editBtn.setAttribute('id', 'edit-question') 
                editIcon.classList.add('fas', 'fa-pen-to-square')
                editBtn.appendChild(editIcon)

                optionsDiv.appendChild(viewBtn)
                optionsDiv.appendChild(editBtn)
                questionContainer.appendChild(optionsDiv)
                questionsWrapper.appendChild(questionContainer)
                console.log('hlll')
            }
        }
    })

    viewQuestionBtn.addEventListener('click', () => {
        const questionModel = document.querySelector('#question-model')
        questionModel.classList.toggle('hidden')
    })

    closeModel.addEventListener('click', () => {
        const questionModel = document.querySelector('#question-model')
        questionModel.classList.toggle('hidden')
    })
</script>
