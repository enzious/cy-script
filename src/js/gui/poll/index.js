let initializePoll = () => {
    
    socket.on('newPoll', function(data) {
        var title = data.title.match(/\[img\]&#40;<a href="(https.*\.(?:jpg|jpeg|png|gif))&#41;" target="_blank">(?:\1)&#41;<\/a>/i);
        if (title) {
            if (title[1].startsWith('https')) {
                $('div.well.active > h3').html('<img src="' + title[1] + '" class="poll-img" />');
            }
        }
    });
}
export { initializePoll, };
