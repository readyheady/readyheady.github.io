// Global Variables
let masterTimer = null;
let customMode = null;
let currentPreset = null;

// Default Settings
let settings = {
    darkMode: false,
    torchTime: 3
}

// Predefined Timers
let predefinedTimers = [
    {
        name: 'Standard 30mm',
        heatupTime: 40,
        cooldownTime: 60,
        actionTime: 45

    },
    {
        name: 'Wide 35mm',
        heatupTime: 45,
        cooldownTime: 70,
        actionTime: 50

    },
    {
        name: 'Slim 25mm',
        heatupTime: 35,
        cooldownTime: 50,
        actionTime: 40
    }
]

// Using JavaScript classes as a way to allow the timer to be destructable if user decides to stop.
class Timer {

    constructor(heatupTime, coolDownTime, actionTime) {
      this.heatupTime = heatupTime;
      this.coolDownTime = coolDownTime;
      this.actionTime = actionTime;
      this.timer = null;
    }

    init = () => {

        $('#timeRemaining').text(`Get Ready...`);
        $('#message').text('-');

        this.buffer(settings.torchTime, (done) => {
            if (done) {

                let heatupTime = this.heatupTime;
                let coolDownTime = this.coolDownTime;
                let actionTime = this.actionTime;

                this.setupTimer('Heat up! hold torch perpendicular to center', heatupTime, 1).then(() =>
                this.setupTimer('Cooling down, please wait.', coolDownTime, 2)).then(() =>
                this.setupTimer('!!!', actionTime, 3)).then(() => stop())
                .catch(err => {
                    if (err) console.error(err)
                });

            }
        });
    }

    buffer = (seconds, callback) => {
        setTimeout(() => {
            return callback(true);
        }, seconds * 1000);
    }

    setupTimer = (mode, seconds, step) => {
        let _this = this;
        return new Promise((resolve, reject) => {
            let secondsRemaining = seconds;
            _this.timer = setInterval(() => {
                secondsRemaining--;
                this.updateStatus(mode, secondsRemaining, step);
                if (secondsRemaining == 0) {
                    clearInterval(_this.timer);
                    return resolve(true);
                }
            }, 1000);
        });
    }

    updateStatus = (mode, secondsRemaining, step) => {
        $('#step').text(step);
        $('#timeRemaining').text(`${secondsRemaining} Seconds Left`);
        $('#message').text(mode);
    }

    destroy = () => {
        clearInterval(this.timer);
    }

}

// Main App Functions

let stop = () => {

    masterTimer.destroy();
    masterTimer = null;

    // Update UI
    $("#mode").removeAttr("disabled", "disabled");
    $("#startTimer").removeAttr("disabled", "disabled");

    if (customMode) {
        $("#heatupTime").removeAttr("disabled"); 
        $("#cooldownTime").removeAttr("disabled"); 
        $("#actionTime").removeAttr("disabled");
    }
    
    $("#stopTimer").attr("disabled", "disabled");

    // Reset Values for Active Display
    $('#step').text(0);
    $('#timeRemaining').text('');
    $('#message').text('');

}

let start = (heatupTime, coolDownTime, actionTime) => {
    masterTimer = new Timer(heatupTime, coolDownTime, actionTime);
    masterTimer.init();
}

// jQuery & User Interface

$(document).ready(function() {

    $('#startTimer').click(function() {

        let heatupTime = parseInt($("#heatupTime").val());
        let cooldownTime = parseInt($("#cooldownTime").val());
        let actionTime = parseInt($("#actionTime").val());

        if (customMode) {
            if (!heatupTime || !cooldownTime || !actionTime) {
                return alert('Can\'t have empty values!');
            }
            start(heatupTime, cooldownTime, actionTime);
        } else {
            let presetIndex = parseInt($('select#mode option:selected').attr('value'))
            currentPreset = predefinedTimers[presetIndex];
            start(currentPreset.heatupTime, currentPreset.cooldownTime, currentPreset.actionTime);
        }

        // Gray Out all the boxes while the timer is active
        $("#mode").attr("disabled", "disabled"); 
        $("#heatupTime").attr("disabled", "disabled"); 
        $("#cooldownTime").attr("disabled", "disabled");
        $("#actionTime").attr("disabled", "disabled"); 
        $("#startTimer").attr("disabled", "disabled"); 

        // Enable Stop Button
        $("#stopTimer").removeAttr("disabled"); 

    });

    $('#stopTimer').click(function() {
        stop();
    });

    $('#mode').change(function() {
        if ($('#mode').val() == '3') {
            customMode = true;
            $("#heatupTime").removeAttr("disabled"); 
            $("#cooldownTime").removeAttr("disabled"); 
            $("#actionTime").removeAttr("disabled"); 
        } else {
            customMode = false;
            $("#heatupTime").attr("disabled", "disabled");
            $("#heatupTime").val('');
            $("#cooldownTime").attr("disabled", "disabled");
            $("#cooldownTime").val('');
            $("#actionTime").attr("disabled", "disabled"); 
            $("#actionTime").val('');
        }
    });

});