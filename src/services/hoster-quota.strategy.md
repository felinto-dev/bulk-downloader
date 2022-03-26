** Problem: Find a hoster that has download quota left in the most efficient way possible. **

Solution 1:
	Steps:
		1. Find a hoster that has downloads quota left and release at date frame is equal or less than the current date.
		2. When found a hoster that has no downloads quota left, should increment the release at date frame by the period.
		3. If no available hoster is found, return null.
	Pros: It is easy to understand the logic and efficient.
	Cons: Confuse to implement.

Solution 2: Should based on events to increment the release at date frame and avoid processing the same hoster twice.
	Events to listen:
		Hoster has no quota left: Increment the release at date frame by the period whom run out of the quota.
		Hoster was picked up for pull downloads: Increment the release at until next interaction. (Default is 1 hour)

Solution 3: Store in memory the used quota by hoster and based on events triggers.
	Steps:
		1. Copy on bootstrap all the hosters and their limit quota.
		2. Calculate the used quota by hoster based on made downloads.

	Listen for events:
		On download made: Recalculate the used quota by hoster.
		On hoster has no quota left: Increment the release at date frame by the period whom run out of the quota.
		On hoster was picked up for pull downloads: Change download status to "DOWNLOADING".
		On hoster has no more downloads for pull: Change download status to "AVAILABLE".
		On hoster added: Add the hoster to the list of hosters and set the used quota to 0.

	Pros:
		- It is easy to understand the logic and efficient.
		- It is easy for testing.
	Cons:
		- Confuse to implement because of the complexity of the data structure and is based on events.
