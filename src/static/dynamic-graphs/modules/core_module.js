// create svg for time-series and word-cloud
var coreModule = (function (d3Object) {

    var maxScreenWidth = window.innerWidth; // width will be numeric
    var maxScreenHeight = window.innerHeight; // height will be numeric

    console.log('inner width and height ', maxScreenWidth + '  ' + maxScreenHeight);


    function _initiateD3Graphs() {

        let default_width = document.getElementsByClassName('wordcloudcont')[0].innerWidth;
        let default_height = document.getElementsByClassName('wordcloudcont')[0].innerHeight;
        // var default_ratio = default_width / default_height;



        var tsSVG = d3Object.select('.time-series-container')
            .append('svg')
            .attr('id', 'timeSeriesSVG')
            .attr('class', 'time-series-svg');



        var dataObject = dataModule.getDataObject();
        // send data to create time-series graph
        // timeSeriesModule.generateTimeSeriesGraph(dataObject, tsSVG);
        // send data to create word-cloud graph
        singleTimeSeriesModule.generateTimeSeriesGraph(dataObject, tsSVG);


        var staticData = `probably one of the important transgenics as sir we are going to have a add ice interaction with the program out of the country and he is going to a prizes on you see the way forward I think all of you
        are aware Saturday country is moving towards the LTV strategy and in that sense we are all having new initiatives Barbie TV control program in fact in the morning that I was Abed in the meeting with
        the deputy director-general tuberculosis as well as in that meeting we were discussing on the new are initiatives and I'm sure dr. Sunita party will have a lot of information for you and I see that he
        has joined us apart a welcome our to the clinic because we are Division and he's going to interact with us directly from his owner Panda I also have a bruise who are already joined us on these clinics
        and he's probably the one who initiated this proraso I think Bruce and how to thank you for that and we have a you know 25 GTOs are here and stay TV officers also as well as the Espy host on Undisputed
        call sgo crumbly walls with us in the morning at least busy in the office of the ddhs trying to help a sprained National policy on how to go about the new initiatives as far as ending TV is concerned
        nobodies UP Rewards I request of the Deputy director-general a tuberculosis of the one of the things the morning doctors are you coming with a new schedule 2017 I would just speak normally about $28
        cases of beer at least 27% of the world population is the number of India TV. Neisha FL rbndi reality and that's the way it is... We all seen that Before You Go-Go I was just like to say that we are in
        1 min direct involvement in private sector shows that there is a donation report what is the radio station from government Douglas private-sector ostomy protective order coming to the private sector as
        you very well know this is another opposite meaning what are mixing board and duration I can see in the last last three of the other seen that which is already won the Mississippi Senate approve I'll
        be home every year extension of the boot on a 2017 F-150 Ford what is tipping a government of India install about about Ireland that you would like answered with the state government that they will
        know we are not the microscope 2016 Dodge Avenger another initiative has started the antique that is a medically needy patient the six centers in the country has big hospitals like one of the boys in
        the in the state of weho already included I already have any commitments USA 2018 another word for intervention in last year. We are going to be working together and also i p h i v Bible country daily
        living Airborne infection control spending this activity has been the Main Street businesses are we hiding in the Ice Age. quality, and as soon as the old west weather of pink I would like to see is
        that you will start in a few and then I will be able because I needed to be, when we are grieving and that's not what we are deeply. Very fast and expanding the entire country directions to ICC best
        that's got to be a part of the program and they missed call campaign information you got to stop redness in public automotive industry Margaritaville Hollywood population Bermuda travel trailer for the
        patient would you support the patient ICD best I take of a he deserves a very big and he's leading us all because in a very very short time I mean it's just barely fifteen minutes he has a yellow paint
        a landscape he has shown me how we are going to move very aggressively into disease and try to see how we can and TV by 20 35 maybe even sure I find a doctor Kapolei I'm sorry I can assure you that as
        part of your team all of us who are are you not working today are you off to work alone or not only your not Institute not only in this state of Delhi we are with you in this battle and I'm sure we've
        been wet before you know I can do this expectation I will invite some questions from you know that do you start having about 28 boxer right now I'm recovering about a hundred participants are you
        having the hearing the event so if there is any question are most welcome and no questions and we can control the static and we can move to the next stage and we would once again 1 to time dr. kabadi
        for this very enlightening make sure that you do the case presentation next would be with dr. Anand is, and we know request I think I love you hello I should be presenting the history of any contact
        with I know she's a mystery is a gs-12 I'll be sharing the stream video he's going to share screen with the green button on your laptop and then open the folder yes BBC head received at or at least
        more than eight month Libor so she was 2014 carbon from here to extend EIP for another one in the meantime Angie was revealed to be this resistance case movie category for was carted on the August 2014
        for the treatment of animals unless you download some getting problem does next appointment is December the 6th month Benjamin positive and subsequently shortest animation st. Cloud Minnesota passing
        Planet through my skin is locks of Ross i n a case of severe anemia Richard Brunner volume of 75% lymphocytes 40% on Albany distance is -1 dixiana yes so we can see so this is basically a this is the
        first one when she was a levite second act this was done May 2015 minimum changing the exhibition as you consider. This is the latest in the last episode this was me. Your mom died in December 2014
        January 2015 deep tissue back where we would like to discuss are whether we're dealing with a frequent of rapidly changing digital she continues to have a weakness of a lot of things but there is no,
        not to mention that we had to stop because he was basically do you want to give up so I don't know. It's a beautiful presentation almost a perfect presentation I should say other than what is my
        schedule for America's positive or 11th month of gas and then orientation to be a category 5 minutes reduce high school almost total hearing loss in Fresno, to take over and thank you, it was a very
        concise and complete the game presentation I will welcome. I miss from Ellen G be grateful to you that you have taken time to join us and give us your available opinion I would request you to give your
        opinion regarding this particular summarize the Ultimate Realty next time I seen in complete hearing loss as a as a toxicity report which station has some degree as a responsible for conversion of the
        sound energy into electrical energy and then transferring this energy to the brain and I must tell you about the association that interpretation is diabetic and hypertensive the incidence of a tax
        increases as well as Virginia history regarding tutanota so this is me and if you see can see where is there to take money the frequency and intensity of the lakes and if you see that the intensity of
        this song bone conduction and air conduction in this label is indicating that idea and the left graph be black and blue color is within range is normal hearing to 5510 2008 intensity of sound - 10 to
        120 decibels next song okay so when the patient received kanamycin breath and he has some ototoxicity you will have a high frequency in volume so you can see that level has decreased the glasses
        actually going down in the range of 2000 to 8000 frequency diagnosis can be done by using high-frequency audiometry and you can have a date in the high frequency of region in geography and if you see
        the speech frequency which is this is normal slime in normal range in this speech frequency so the patient will not have any hearing loss will be diagnosed only on a high frequency not complain of
        hearing loss but he will mock he might have a lighter so he would say that I am having some ringing sensation or some in the year baby how high to moderate hearing loss in which you can have in volume
        at low speed frequency and at this time the patient would say that I'm hearing Less in what order are simultaneous add is the flatcar audibel hearing loss in which you can see the sequence the
        intensity of the hearing level is down to almost 90 decibels in high-frequency conceited going up 210-220 on hearing loss in which the patient would have almost negligible and these patients cannot be
        treated with high-powered hearing and they might require a copy of garlic Adidas small presentation on my Center might actually endangers the life of Acacia Richmond has to be individualized and the
        patient should be concerned about that about the drug overdose and concern regarding a former compete in the getting lost because Libra and especially having Progressive hearing loss on Atkins lights
        on during a dressing obviously there's no other choice than to stop you have to stop and start an outlet reports about the use of antioxidants and management of ototoxicity in animals as humans that
        are free radicals and antioxidants have some Road and maybe started on vitamin E or alpha lipoic acid plus vitamin C I would like to have any questions in there any questions I would like to thank you
        very much thank you dr. David it was wonderful. Which we all had regarding the ototoxicity sir no I would request all present and it has a question what is not is mild moderate or severe so it did not
        reversible kanamycin is not reversible what I mean is the second question is it normal what happens if I didn't want to be certain of the popular vote but she talked to Pat McAfee questions on the
        state of Canada's I cannot make up the words that you are speaking so I can hear you speaking so is that a manifestation I pregnancy Yes actually this is a manifestation of any sensorineural hearing
        loss what happens in any sense when we say that there's a problem Walmart because they will say that I am and this kind of cleaning with kanamycin on I think ask a question incessant yet off of the
        symptoms of an individual's susceptibility to look anime this economy is stopping this is a very very important than school and stopping might endanger the life of education so it has to be a man you
        have to actually a balance on. Intra-african actress open you can get portrait therapy or B if stopping will actually cost more to stop reading light play moderate hearing loss and almost all the
        equation for undergo are planning for women patients like patients having phototoxicity I just do you have a question please my question is that is that is that Michigan State the word on any other
        drugs to prevent liver detox vitamin C antioxidant mcnicol evidence available animal control in order. dr. Marten boots on Android what in these cases what can we do when we are sufficient for the
        blood transfusion or anything else anybody can say this because we will be coming next to this topic because we're discussing about the ototoxic sing the questions are there any more questions I would
        like to work Reagan XTR patients are also treated with regiment other than gender cleaning of MBR patient for workout facility in we start a note anime Central Station might have been after you start
        economizing then you should have maybe a monthly audiometry test does a high frequency screening will be diagnosed in history test at 4608 Amicus if you double up on here one question yes yes. Bacolod
        I can see you how do you say yes because I know she's most volatile gland is located only in patients who have profound sensorineural hearing loss with no improvement in hearing it solicitation had a
        profound sense of hearing loss and he had no improvement in hearing with hearing aids be use lead to why you let him talk you into her because volume this melody Quality Financial open space and then
        secondly it is better than spilling Wilderness Speech & Language Meineke for profound hearing loss thank you it was an excellent excellent interaction with you is the first time we have people in the
        field have come across with too much information on ototoxicity of a second-line drug what is the date for message Gordon doesn't start at a high PT patient go to the patient must be very patient
        information Fordham at all Yahoo there are many people who want to ask questions so I think I may have to take care of all the other questions that an Obi belt of the management of this place 7 for an
        excellent presentation and I think one of the problems that your patient was having one that is 8.3 + 108.9 what does request everyone that whenever we have a low HD report for the simple reason that
        anemia is tuberculosis a combination of different reasons she has just born to children so they will be an element of iron deficiency anemia but then you have to understand that in tuberculosis it is
        very common to get macrocytic anemia affect the absorption of anticipation Scandal Italy get made out of plastic anemia anemia of chronic disease anemia properly and or if my show only megaloblastic or
        if my chihuahua combination in my truck. Dimorphic kind of a picture then it will be my last or if they show in rare cases it can show a normal setting now or did you have to do is manage the disease
        blood transfusions should be avoided as much as possible the current recommendation does not allow for frequent blood transfusions because we are all very very scared of injecting operations with
        Bloods been on a lot of blood and blood products because you asked for universal precautions guidelines do not know they might be other organism starting in the blood except of the patient has both
        love going into LPS has a HP below by listing without a pictures of macrocytic injection beach with our regular price check for bleeding from McDonald's plastic injection combined to go to give a rain
        check for bleeding vitamin B12 normocytic normochromic treat the primary disease and blood transfusion only if the patient has an HP of 405 is very sick is in NBA points to have a small puppy PTO
        PowerPoint to tell us how to manage these the patient because anemia is one condition that we come across on a regular basis with or if you have any questions please raise your hand Michelle please the
        next step of getting a microcytic anemia is to data iron study. If you are a study shows that you are in stores are normal and still the patient has a bottom feeder indication Duty dually for making
        money and protect us your point is well-taken a person what is the little square picture and then maybe go on Trump Asians on hdr on Legolas what would you like to have low blood testing on. Okay. What
        about cushingoid teacher. Cheeseburger right now I can see no reason for us pushing white faces because we are not given steroids for whatever you're doing for anemia is correct what is it normal to
        drug effects of an examination of the patient would be required in the issues that you had was inside a frequent of Rapid change in the nature of mycobacteria that we can only comment when we have so
        that is something that we cannot stay right now your second question was on hearing loss and then telling me I'm special guidelines on the management of sending you that we have discussed today and
        combinations will be coming to you thanks everybody for a very successful and now I have a very important announcement. end-of-the-year Moustakas might not be so I will not be having the clinic next
        week on 4th January so thank you very much a very Happy New Year dr. Bruce thank you. David thanks a lot for being here. And all my colleagues and thank you so much and I will regret. Do you like my
        videos dr. Sinha. Early to Andover College `;

        // Use Case 1 : Fetching data from a URL and passing the data and component ID to create a Word Cloud

        var httpData;
        var stopWords = 'ABC,we\'re,dino,It,Thinkin';
        const request = new Request('https://api.myjson.com/bins/80zl0');

        //var dataOfCancer;
        fetch(request)
            .then(blobResponse => blobResponse.json())
            .then(response => {
                console.log('data is ', response);
                httpData = response.data;
                wordCloudModule.wordCloudGenerator({
                    containerid: '.wordcloudcont',
                    wordclouddata: httpData,
                    stopwords: stopWords
                });
            })
            .catch(error => {
                console.error(error);
            });


        // Use Case 2 : Passing the static data and component ID to create a Word Cloud

        let stopWordsNew = ['Cheeseburger', 'being', 'all', 'at'];
        wordCloudModule.wordCloudGenerator({
            containerid: '#tbcloud',
            wordclouddata: staticData,
            stopwords: stopWordsNew
        });
        // wordCloudModule.getD3({wcSVGLeft,wcSVGRight})
    }
    return {
        initiateD3Graphs: _initiateD3Graphs
    }
})(d3)