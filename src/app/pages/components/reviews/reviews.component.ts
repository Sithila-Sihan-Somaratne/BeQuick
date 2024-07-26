import { Component, ViewChild } from '@angular/core';
import { StarRatingComponent } from './star-rating/star-rating.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [StarRatingComponent],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent {
  @ViewChild(StarRatingComponent) starRatingComponent!: StarRatingComponent;

  submitReview() {
    let reviewInput = document.getElementById("review") as HTMLTextAreaElement;
    let review = reviewInput?.value;
    console.log(review);
    let rating = this.starRatingComponent.rating;
    const reviewsContainer = document.getElementById("reviews") as undefined | HTMLDivElement;
    if (!review || !rating) {
      return alert("Input your rating and insert your review before submitting.")
    } else {
      const reviewElement = document.createElement("div");
      reviewElement.classList.add("review");
      reviewElement.innerHTML =
        `<p><strong>Rating: ${rating}/5</strong></p><p>${review}</p>`;
      if (reviewsContainer) {
        reviewsContainer.appendChild(reviewElement);
      }

      if (reviewInput instanceof HTMLTextAreaElement) {
        reviewInput.value = "";
      }
      this.starRatingComponent.resetRating();
    }
  }

}
