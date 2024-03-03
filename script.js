document.addEventListener('DOMContentLoaded', function () {
  // Sample user data with interactions
  const users = [
    { id: 0, name: 'User 0', interactions: [1, 0, 1, 1, 0] },
    { id: 1, name: 'User 1', interactions: [0, 1, 1, 0, 0] },
    { id: 2, name: 'User 2', interactions: [1, 0, 1, 0, 1] },
    { id: 3, name: 'User 3', interactions: [1, 1, 0, 0, 1] },
    { id: 4, name: 'User 4', interactions: [0, 1, 1, 1, 0] },
    { id: 5, name: 'User 5', interactions: [1, 0, 0, 1, 1] },
    { id: 6, name: 'User 6', interactions: [0, 0, 1, 0, 1] },
    { id: 7, name: 'User 7', interactions: [1, 1, 1, 1, 1] },
    { id: 8, name: 'User 8', interactions: [0, 0, 0, 1, 1] },
    { id: 9, name: 'User 9', interactions: [1, 0, 1, 0, 0] }
  ]

  const items = [
    { id: 0, name: 'Item 1' },
    { id: 1, name: 'Item 2' },
    { id: 2, name: 'Item 3' },
    { id: 3, name: 'Item 4' },
    { id: 4, name: 'Item 5' }
  ]

  // Data structure to track user-item interactions
  const interactions = new Map()

  // Populate interactions data structure
  users.forEach((user) => {
    interactions.set(user.id, new Set())
    user.interactions.forEach((interaction, index) => {
      if (interaction === 1) {
        interactions.get(user.id).add(index)
      }
    })
  })

  // Function to calculate similarity between two users based on interactions
  function calculateSimilarity(user1, user2) {
    let commonInteractions = 0
    let length1 = 0
    let length2 = 0

    for (let i = 0; i < user1.length; i++) {
      commonInteractions += user1[i] * user2[i]
      length1 += user1[i] * user1[i]
      length2 += user2[i] * user2[i]
    }

    // Calculate similarity without Math.sqrt
    const similarity =
      length1 > 0 && length2 > 0 ? commonInteractions / (length1 * length2) : 0

    return similarity
  }

  // Function to generate user similarity matrix
  function generateUserSimilarityMatrix(users) {
    const similarityMatrix = []

    for (let i = 0; i < users.length; i++) {
      const row = []

      for (let j = 0; j < users.length; j++) {
        if (i === j) {
          row.push(1) // Similarity with oneself is 1
        } else {
          const similarity = calculateSimilarity(
            users[i].interactions,
            users[j].interactions
          )
          row.push(similarity)
        }
      }

      similarityMatrix.push(row)
    }

    return similarityMatrix
  }

  // Function to generate recommendations based on user similarity
  function generateRecommendations(users, userSimilarity) {
    const recommendations = []

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const userRecommendations = []

      for (let j = 0; j < items.length; j++) {
        if (!user.interactions[j]) {
          // Only recommend items not interacted with
          let weightedSum = 0
          let similaritySum = 0

          for (let k = 0; k < users.length; k++) {
            if (k !== i) {
              const similarity = userSimilarity[i][k]
              weightedSum += users[k].interactions[j] * similarity
              similaritySum += Math.abs(similarity) // Accumulate absolute similarity values
            }
          }

          if (similaritySum !== 0) {
            const recommendationScore = weightedSum / similaritySum

            // Log intermediate values for examination
            console.log(`User: ${user.name}, Item: ${items[j].name}`)
            console.log(`Weighted Sum: ${weightedSum}`)
            console.log(`Similarity Sum: ${similaritySum}`)
            console.log(`Recommendation Score: ${recommendationScore}`)

            userRecommendations.push({
              item: items[j].name,
              score: recommendationScore
            })
          }
        }
      }

      // Remove duplicates from userRecommendations based on item
      const uniqueRecommendations = Array.from(
        new Set(
          userRecommendations.map((recommendation) => recommendation.item)
        )
      ).map((item) => {
        const scoresForItem = userRecommendations.filter(
          (rec) => rec.item === item
        )

        const averageScore =
          scoresForItem.reduce((sum, rec) => sum + rec.score, 0) /
          scoresForItem.length
        return { item, score: averageScore }
      })

      // Sort unique recommendations by score
      const sortedRecommendations = uniqueRecommendations.sort(
        (a, b) => b.score - a.score
      )

      // Push recommendations to the final array
      recommendations.push(sortedRecommendations)
    }

    return recommendations
  }

  // Calculate user similarity matrix
  const userSimilarity = generateUserSimilarityMatrix(users)

  // Display user interactions
  const interactionsTable = document
    .getElementById('interactionsTable')
    .getElementsByTagName('tbody')[0]
  for (let i = 0; i < users.length; i++) {
    const row = interactionsTable.insertRow()
    const userCell = row.insertCell(0)
    userCell.textContent = users[i].name
    for (let j = 0; j < items.length; j++) {
      const cell = row.insertCell(j + 1)
      cell.textContent = users[i].interactions[j]
    }
  }

  // Display user similarity
  const similarityTable = document
    .getElementById('similarityTable')
    .getElementsByTagName('tbody')[0]
  for (let i = 0; i < users.length; i++) {
    const row = similarityTable.insertRow()
    const userCell = row.insertCell(0)
    userCell.textContent = users[i].name
    for (let j = 0; j < users.length; j++) {
      const cell = row.insertCell(j + 1)
      cell.textContent = userSimilarity[i][j].toFixed(3) // Display similarity with two decimal places
    }
  }

  // Generate recommendations
  const recommendations = generateRecommendations(users, userSimilarity)

  // Display recommendations
  const recommendationsTable = document
    .getElementById('recommendationsTable')
    .getElementsByTagName('tbody')[0]

  for (let i = 0; i < users.length; i++) {
    const row = recommendationsTable.insertRow()
    const userCell = row.insertCell(0)
    userCell.textContent = users[i].name

    const recommendedItemsCell = row.insertCell(1)
    const recommendationScoresCell = row.insertCell(2)

    const userRecommendations = recommendations[i]

    // Extract item names and scores
    const recommendedItems = userRecommendations
      .map((recommendation) => recommendation.item)
      .join(', ')
    const recommendationScores = userRecommendations
      .map(
        (recommendation) =>
          (recommendation.score.toFixed(2) * 100).toFixed(0) + '%'
      )
      .join(', ')

    recommendedItemsCell.textContent = recommendedItems
    recommendationScoresCell.textContent = recommendationScores
  }
})
