let initializeVidResize = () => {
    function defaultWidth() {
        const wraps = {
            videowrap: $('#videowrap'),
            chatwrap: $('#chatwrap'),
            rightcontrols: $('#rightcontrols'),
            leftcontrols: $('#leftcontrols'),
            pollwrap: $('#pollwrap'),
            rightpane: $('#rightpane'),
            leftpane: $('#leftpane')
        };
        $.each(wraps, ((k, v) => {
            v.removeClass();
        }));
        $('#leftcontrols,#chatwrap,#leftpane').addClass('col-lg-5 col-md-5');
        $('#rightcontrols,#rightpane,#videowrap').addClass('col-lg-7 col-md-7');
        $('#pollwrap').addClass('col-lg-12 col-md-12');
        localStorage.setItem(`${CHANNEL.name}_vidWidthSetting`, '0');
        handleVideoResize();
    }

     $("#resize-video-larger").click(() => {
        let widthPositive = parseInt(localStorage.getItem(`${CHANNEL.name}_vidWidthSetting`));
        let notNeg = Math.sign(widthPositive) !== -1;
        const change = CyTube.ui.changeVideoWidth;
        const chanStore = `${CHANNEL.name}_vidWidthSetting`;
        try {
            if (widthPositive < 1 && notNeg) {
                localStorage.setItem(chanStore, "1");
            }
            if (widthPositive === 1 && notNeg) {
                localStorage.setItem(chanStore, ++widthPositive);
            } else if (widthPositive === 2 && notNeg) {
                change(-2);
                localStorage.setItem(chanStore, '0');
            } else if (Math.sign(widthPositive) === -1) {
                defaultWidth();
            } else if (widthPositive === 0) {
                return;
            } else {
                throw `localStorage setting at unexpected value:  ${widthPositive}`;
            }
        } catch (e) {
            console.error(e);
            defaultWidth();
        }
    })
     $("#resize-video-smaller").click(() => {
        let widthNegative = parseInt(localStorage.getItem(`${CHANNEL.name}_vidWidthSetting`));
        let notPos = Math.sign(widthNegative) !== 1;
        const change = CyTube.ui.changeVideoWidth;
        const chanStore = `${CHANNEL.name}_vidWidthSetting`;
        try {
            if (widthNegative > -1 && notPos) {
                localStorage.setItem(chanStore, '-1');
            }
            if (widthNegative === -1 && notPos) {
                localStorage.setItem(chanStore, --widthNegative);
            } else if (widthNegative === -2 && notPos) {
                change(3);
                localStorage.setItem(chanStore, '0');
            } else if (Math.sign(widthNegative) === 1) {
                defaultWidth();
            } else if (widthNegative === 0) {
                return;
            } else {
                throw `localStorage setting at unexpected value:  ${widthNegative}`;
            }
        } catch (e) {
            console.error(e);
            defaultWidth();
        }
    });
    $(document).ready(() => {
        let widthSettingInt = parseInt(localStorage.getItem(`${CHANNEL.name}_vidWidthSetting`));
        let signCheck = Math.sign(widthSettingInt);
        const changeTo = CyTube.ui.changeVideoWidth;
        
        !localStorage.getItem(`${CHANNEL.name}_vidWidthSetting`)
            ? localStorage.setItem(`${CHANNEL.name}_vidWidthSetting`, '0')
            : 0;//console.log(`Video width set to ${localStorage.getItem(CHANNEL.name + '_vidWidthSetting')}`)
        
        if (signCheck === 0) {
            return;
        }
        if (widthSettingInt === 1 && signCheck !== -1) {
            changeTo(1);
        } else if (widthSettingInt === 2 && signCheck !== -1) {
            changeTo(2);
        } else if (widthSettingInt === -1 && signCheck !== 1) {
            changeTo(-1);
        } else if (widthSettingInt === -2 && signCheck !== 1) {
            changeTo(-2);
        } else {
            console.log('Something went wrong, resetting width.');
            defaultWidth();
        }
    });
};
export { initializeVidResize, };