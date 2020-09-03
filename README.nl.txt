Er zijn twee manieren om met deze app te werken:

Je installeert een apparaat wat telkens om 30 seconden na iedere gehele 10 minuten de laatste gegevens van het KNMI ophaalt.
Voor iedere waarde in het apparaat bestaat daarnaast een trigger die uitgevoerd wordt wanneer er iets aan die waarde verandert.
Deze triggers hebben allen twee tags, de oude waarde en de nieuwe waarde.

Je kunt dus eenvoudig een flow maken die af gaat wanneer het huidige weerbeeld van onbewolkt naar iets anders veranderd om je zonnescherm dicht te doen.

Daarnaast is het mogelijk om handmatig de laatste gegevens op te halen door een actie kaart uit te laten voeren.
Deze actie kaart laat op zijn beurt weer een trigger af gaan voor met de nieuw ontvangen gegevens.
Voor alle waarden in het apparaat zijn ook tags toegevoegd op de ontvangst van die gegevens, daarin zit geen verschil.

Voor het ophalen van de weer gegevens wordt de locatie van Homey zelf gebruikt.
In totaal mag 300x per dag de api van weerlive.nl aangeroepen worden.