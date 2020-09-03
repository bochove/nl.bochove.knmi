This app uses Homey's location to fetch the weather data, the only parameter required is the API Key from weerlive.nl.

Fetches dutch weather data from the KNMI up to 300 times a day.
There are two options for this app, either you only fetch data when you need it by calling an action card on a flow,
that in turn fires a trigger card for receiving new data.
The trigger card gives you many tags to use in your flow.

Or you can add a KNMI device that automatically fetches new data at 30 seconds after every whole 10 minutes and updates the device capabilities with it.
In the last case you can simply use these capabilities in logic cards at will and you will always have the latest possible data.
So to visualize when new data is fetched:
00:00:30 (30 seconds after midnight)
00:10:30
00:20:30
...
12:30:30
12:40:30

Additionally you can make use of an on change trigger card for every value available in the device. Each of those triggers has two tags, one for the old value and one for the new value. This means it's going to be easy to create a flow to close your sun screen when the recap changes from 'Onbewolkt' to something else. Do note that the recap data provided in the app is Dutch, it does not get translated. The data that is provided by weerlive is shown unchanged.

