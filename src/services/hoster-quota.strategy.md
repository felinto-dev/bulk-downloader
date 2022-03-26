Problem: Find a hoster that has download quota left in the most efficient way possible.

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
